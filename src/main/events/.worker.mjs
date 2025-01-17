import fetch from 'node-fetch';
import fs from 'fs';
import { promisify } from 'util';
import stream from 'stream';
import workerpool from 'workerpool';

const pipeline = promisify(stream.pipeline);
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');

async function downloadChunk(chunkData, totalWorkerSize, workerId) {
    let totalDownloaded = 0;
    let startTime = Date.now();
    // return 'bah'
    const chunkPromises = chunkData.map(async ({ url, start, end, dest, fileName, fileType, localId }) => {
        const res = await fetch(
            url,
            {
                headers: {
                    Range: `bytes=${start}-${end}`
                }
            }
        )
            
        if(!res.ok && res.status !== 206) {
            throw new Error(`Failed to download chunk (status code: ${res.status})`);
        }

        const thisChunkSize = end - start + 1;
        
        if(!fs.existsSync(`${dest}/${fileName}-chunks`)) {
            fs.mkdirSync(`${dest}/${fileName}-chunks`, { recursive: true });
        }

        const fileStream = fs.createWriteStream(`${dest}/${fileName}-chunks/${fileName}.CHUNK-${workerId}`);

        if (res.body === null) {
            throw new Error('Response body is null');
        }
        res.body.on('data', (ch) => {
            console.log('down');
            totalDownloaded += ch.length;
            const progress = Math.round((totalDownloaded / totalWorkerSize) * 100);

            const currentTime = Date.now();
            const timeTaken = (currentTime - startTime) / 1000;
            const speed = ch.length / timeTaken;

            workerpool.workerEmit({
                id: workerId,
                progress,
                speed
            });
        })

        await pipeline(res.body, fileStream);
        fileStream.end();
    });

    await Promise.all(chunkPromises);
    return `Worker #${workerId} finished downloading!`;
}

workerpool.worker({ downloadChunk });

export default { downloadChunk }