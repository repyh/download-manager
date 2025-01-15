import eventInterface from './eventInterface';
import electron from 'electron';

export default {
    eventName: 'ipc-example',
    execute: (event: electron.IpcMainEvent, arg: any, app: electron.App, window: electron.BrowserWindow) => {
        const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
        console.log(msgTemplate(arg));
        event.reply('ipc-example', msgTemplate('pong'));
        // setTimeout(() => {
        //     window.close();
        //     console.log('asdasdasdasd');
        // }, 5000)
    }
} as eventInterface;