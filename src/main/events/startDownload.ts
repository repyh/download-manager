import eventInterface from './eventInterface';
import electron from 'electron';

import fetch from 'node-fetch';
import fs from 'fs'
import { fileTypeFromStream } from 'file-type';
import cli from 'cli-progress'
import os from 'os';
import workerpool from 'workerpool';
import stream from 'stream';
import { promisify } from 'util';
import path from 'path';

const pipeline = promisify(stream.pipeline);

class Downloader {
    private fileSize: number = 0;
    private splitSize: number = 0;
    private totalProgress: number = 0;

    private workerProgress: Array<number> = [];
    private fileType: string = '';
    private workerSpeeds: Array<any> = []
    private pool = workerpool.pool(__dirname + '../../../src/main/events/.worker.mjs');
    private event: electron.IpcMainEvent;

    public filename : string = '';
    public url: string;

    constructor(url: string, event: electron.IpcMainEvent) {
        this.url = url;
        this.event = event;
    }

    public startDownload(destination: string, chunksNum: number, workers: number) {
        this.downloadFileInChunks(destination, chunksNum, workers);
    }

    private async getFileSize(): Promise<number> {
        const url = this.url;

        return new Promise((resolve, reject) => {
            fetch(
                url,
                {
                    method: 'HEAD'
                }
            ).then((res) => {
                if(!res.ok) {
                    reject(new Error(`Failed to fetch file size (status code: ${res.status})`))
                } else {
                    const contentLength = parseInt(res.headers.get('content-length') || '0');
                    if(!contentLength) reject(new Error(`Missing 'content-length' header!`));
                    this.fileType = 'temp';

                    const contentDisp = res.headers.get('content-disposition');
                    if(contentDisp && contentDisp.includes('filename=')) {
                        const match = contentDisp.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n.]+)\.[^"';\r\n]+/);

                        if(match && match[1]) {
                            this.filename = decodeURIComponent(match[1]);
                        }
                    }

                    resolve(contentLength)
                }
            }).catch(reject);
        })
    }

    private async downloadFileInChunks(dest: string, chunks: number, workers: number) {
        try {
            const totalSize: number = await this.getFileSize();
            const chunkSize = Math.ceil(totalSize/chunks);

            this.fileSize = totalSize;
            this.splitSize  = chunkSize;

            const promises = [];
            const chunksPerWorker = Math.ceil(chunks/workers);

            for(let workerId = 0; workerId < workers; workerId++) {
                const startChunk = workerId*chunksPerWorker;
                const endChunk = Math.min(startChunk+chunksPerWorker, chunks);

                this.workerProgress[workerId] = 0;
                const chunkPromises = [];
                let workerTotalSize = 0;

                for(let chunkId = startChunk, localId = 0; chunkId < endChunk; chunkId++, localId++) {
                    const start = chunkId*chunkSize;
                    const end = Math.min((chunkId+1)*chunkSize-1, totalSize-1);
                    const chunkPath = `${dest}`;

                    workerTotalSize += (end-start+1);

                    chunkPromises.push({
                        url: this.url,
                        start,
                        end,
                        dest: chunkPath,
                        fileName: this.filename,
                        fileType: this.fileType,
                        localId
                    });
                }

                promises.push(
                    this.pool.exec(
                        'downloadChunk',
                        [
                            chunkPromises,
                            workerTotalSize,
                            workerId
                        ],
                        {
                            on: (payload) => {
                                const {id, progress, speed} = payload;
                                this.workerProgress[id] = progress;
                                console.log(speed)
                                this.workerSpeeds[id] = speed;

                                const totalProgress = this.workerProgress.reduce((acc, curr) => acc + curr, 0) / this.workerProgress.length / 100;

                                try {
                                    this.event.reply('download-progress', ['file', this.filename, this.fileType, this.fileSize, id, progress, totalProgress, this.workerSpeeds])
                                } catch(e) {
                                    console.log('Progress were unable to be retrieved.')
                                }
                            }
                        }
                    )
                    .then((res) => console.log('FUCK'))
                    .catch((err) => console.error(`Worker ${workerId + 1} error:`, err))
                )
            }

            this.event.reply('download-starting', ['file', this.filename, this.fileType, this.fileSize]);
            await Promise.all(promises);

            this.pool.terminate();
            console.log('Merging file...');

            const finalFile = fs.createWriteStream(`${dest}/${this.filename}.${this.fileType}`);

            for(let i = 0; i < chunks; i++) {
                const chunkPath = `${dest}/${this.filename}-chunks/${this.filename}.CHUNK-${i}`;
                const chunk = fs.readFileSync(chunkPath);

                finalFile.write(chunk);
                fs.unlinkSync(chunkPath);
            }

            finalFile.close();
            finalFile.on('finish', async () => {
                console.log('Download complete');

                const oldType = this.fileType;
                const readStream = fs.createReadStream(`${dest}/${this.filename}.${this.fileType}`);
                
                fileTypeFromStream(readStream).then((result) => {
                    if (result) {
                        this.fileType = result.ext;
                        fs.renameSync(`${dest}/${this.filename}.${oldType}`, `${dest}/${this.filename}.${this.fileType}`);
                    }
                    readStream.close();
                    
                    this.event.reply('download-finished', ['file', this.filename, this.fileType, this.fileSize, oldType])
                    fs.rmdirSync(`${dest}/${this.filename}-chunks`);
                })
            })
        } catch(e) {
            console.error(e);
        }
    }
}

export default {
    eventName: 'start-download',
    execute: (event: electron.IpcMainEvent, [downloadUrl, fileName, threads], app?: electron.App, window?: electron.BrowserWindow) => {
        // return console.log(event);
        const download = new Downloader(downloadUrl, event);
        download.startDownload(fileName === 'default' ? path.join(os.homedir(), 'Downloads') : fileName, threads, threads);
    }
} as eventInterface;