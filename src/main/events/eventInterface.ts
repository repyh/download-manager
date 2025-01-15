import { IpcMainEvent, BrowserWindow } from 'electron';

export default interface testHandler {
    eventName: string,
    execute: (event: IpcMainEvent, arg: any, app: Electron.App, window: BrowserWindow | null) => void
}