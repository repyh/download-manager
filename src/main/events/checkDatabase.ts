import eventInterface from './eventInterface';
import electron from 'electron';
import fs from 'fs';

export default {
    eventName: 'check-database',
    execute: (event: electron.IpcMainEvent, arg: any, app: electron.App, window: electron.BrowserWindow) => {
        const appPath = app.getPath('userData');

        if(!fs.existsSync(`${appPath}/sqlite-database`)) {
            fs.mkdirSync(appPath);
        }
    }
} as eventInterface;