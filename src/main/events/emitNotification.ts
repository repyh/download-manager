import { IpcMainEvent, Notification } from 'electron';

export default {
    eventName: 'emit-notification',
    execute: (event: IpcMainEvent, args: [string, string]) => {
        const [title, body] = args;
        
        // Create and show the notification
        const notification = new Notification({
            title,
            body,
            icon: process.platform === 'win32' ? 'resources/icon.png' : undefined
        });
        
        notification.show();
        console.log('Notification emitted', title, body);
        
        return;
    }
};