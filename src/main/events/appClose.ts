import eventInterface from './eventInterface';
import electron from 'electron';

export default {
    eventName: 'close-app',
    execute: (event: electron.IpcMainEvent, arg: any, app: electron.App, window: electron.BrowserWindow) => {
        window.close();
        if (process.platform !== 'darwin') {
            app.quit();
        }
        // setTimeout(() => {
        //     window.close();
        //     console.log('asdasdasdasd');
        // }, 5000)
    }
} as eventInterface;