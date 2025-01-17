import eventInterface from './eventInterface';
import electron from 'electron';

export default {
    eventName: 'get-max-threads',
    execute: (event: electron.IpcMainEvent, args: any, app: electron.App, window: electron.BrowserWindow) => {
        console.log(require('os').cpus().length);
        event.reply('max-threads-retrieve', require('os').cpus().length.toString());
    }
} as eventInterface;