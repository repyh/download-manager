import eventInterface from './eventInterface';
import electron from 'electron';
import ytdl from '@distube/ytdl-core';

export default {
    eventName: 'get-youtube-info',
    execute: async (event: electron.IpcMainEvent, args: any, app: electron.App, window: electron.BrowserWindow) => {
        const [url] = args;
        // console.log('damn')
        const videoInfo = (await ytdl.getInfo(url)).videoDetails;

        event.reply('video-info-retrieved', [videoInfo.title, videoInfo.author.name, videoInfo.likes, videoInfo.viewCount]);
    }
} as eventInterface;