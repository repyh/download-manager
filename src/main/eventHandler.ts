import { ipcMain, IpcMainEvent, BrowserWindow } from 'electron';
import fs from 'fs';
import eventInterface from './events/eventInterface';

// const allEvents: Map<string, eventInterface> = new Map();

export default function(window: BrowserWindow | null, app: Electron.App) {
    for(const file of fs.readdirSync('./src/main/events/')) {
        if(['eventInterface.ts', '.worker.ts'].includes(file) || !file.endsWith('.ts')) continue;
        import(`./events/${file}`).then((module) => {
            const obj: eventInterface = module.default;

            ipcMain.on(obj.eventName, async(event, arg) => {
                obj.execute(event, arg, app, window);
            });
        });
    };
};