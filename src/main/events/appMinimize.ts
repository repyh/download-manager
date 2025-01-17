import eventInterface from './eventInterface';
import electron from 'electron';

export default {
    eventName: 'minimize-app',
    execute: (event: electron.IpcMainEvent, arg: any, app: electron.App, window: electron.BrowserWindow) => {
        window.minimize();
    }
} as eventInterface;