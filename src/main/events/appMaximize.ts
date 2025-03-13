import eventInterface from './eventInterface';
import electron from 'electron';

export default {
    eventName: 'maximize-app',
    execute: (event: electron.IpcMainEvent, arg: any, app: electron.App, window: electron.BrowserWindow) => {
        window.isMaximized() ? window.unmaximize() : window.maximize();
    }
} as eventInterface;