import eventInterface from './eventInterface';
import electron from 'electron';
import path from 'path';
import os from 'os';

export default {
    eventName: 'get-download-path',
    execute: (event: electron.IpcMainEvent, arg: any, app: electron.App, window: electron.BrowserWindow) => {
        const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
        console.log(msgTemplate(arg));
        console.log(app.getPath('userData'));
        event.reply('download-path-retrieve', path.join(os.homedir(), 'Downloads'));
        // setTimeout(() => {
        //     window.close();
        //     console.log('asdasdasdasd');
        // }, 5000)
    }
} as eventInterface;