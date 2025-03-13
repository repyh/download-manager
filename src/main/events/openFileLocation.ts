import eventInterface from './eventInterface';
import electron from 'electron';
import { shell } from 'electron';
import path from 'path';
import fs from 'fs';

export default {
    eventName: 'open-file-location',
    execute: (event: electron.IpcMainEvent, args: any, app: electron.App, window: electron.BrowserWindow) => {
        try {
            const filePath = args[0];
            console.log("Attempting to open path:", filePath);
            
            // If the exact file exists, open its containing folder
            if (fs.existsSync(filePath)) {
                const dirPath = path.dirname(filePath);
                console.log("Opening directory:", dirPath);
                shell.showItemInFolder(filePath); // This shows the file in folder with the file selected
            } else {
                // If the exact file doesn't exist, try to open the download directory
                const downloadPath = filePath.split('/').slice(0, -1).join('/');
                console.log("Falling back to download directory:", downloadPath);
                
                if (fs.existsSync(downloadPath)) {
                    shell.openPath(downloadPath);
                } else {
                    // Last resort: open the user's download folder
                    const userDownloads = path.join(require('os').homedir(), 'Downloads');
                    console.log("Falling back to user downloads:", userDownloads);
                    shell.openPath(userDownloads);
                }
            }
        } catch (error) {
            console.error('Failed to open file location:', error);
        }
    }
} as eventInterface;
