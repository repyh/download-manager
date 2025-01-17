import DownloadURL from "../popups/DownloadURL";
import DownloadYoutube from "../popups/DownloadYoutube";
import { useState, useEffect } from "react";

export default function Main() {
    const { electron } = window;
    const [downloadURLWindow, setDownloadURLWindow] = useState(false);
    const [downloadYoutubeWindow, setDownloadYoutubeWindow] = useState(false);

    const [downloads, setDownloads] = useState(new Map());

    // useEffect(() => {
    //     addDownload('bruh', 1)
    // }, [])

    const updateDownloads = (key: any, newProperty: any) => {
        setDownloads((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(key);
            if (current) {
                const updatedUser = { ...current, ...newProperty };
                newMap.set(key, updatedUser);
            }
            return newMap;
        });
    };

    function addDownload(key: any, value: any) {
        setDownloads((prev) => new Map(prev).set(key, value));
    }

    function removeDownload(key: any) {
        setDownloads((prev) => {
            const newD = new Map(prev);
            newD.delete(key);
            return newD;
        })
    }

    window.electron.ipcRenderer.on('download-progress', (response: any) => {
        switch(response[0]) {
            case 'file': {
                const [type, fileName, fileType, fileSize, workerId, progress, totalProgress, workerSpeeds] = response as ['file' | 'youtube', string, string, number, number, number, number, Array<number>];
                const downloadSpeed = workerSpeeds.reduce((acc, curr) => acc + curr, 0) / workerSpeeds.length / 1024;

                updateDownloads(`${fileName}/${fileType}`, {
                    totalProgress,
                    fileType,
                    status: 'downloading',
                    downloadSpeed
                })
                break;
            }
        }
    })

    window.electron.ipcRenderer.on('download-finished', (res: any) => {
        switch(res[0]) {
            case 'file': {
                const [type, fileName, fileType, fileSize, oldType] = res as ['file' | 'youtube', string, string, number, string];
                // console.log('FINISHED')
                updateDownloads(`${fileName}/${oldType}`, {
                    fileType,
                    finished: true,
                    status: 'finished'
                })
                break;
            }
        }
    })

    window.electron.ipcRenderer.on('download-starting', (res: any) => {
        switch(res[0]) {
            case 'file': {
                const [type, fileName, fileType, fileSize] = res as ['file' | 'youtube', string, string, number];
                addDownload(`${fileName}/${fileType}`, {
                    type,
                    fileName,
                    fileType,
                    fileSize,
                    totalProgress: 0,
                    finished: false,
                    status: 'starting',
                    downloadSpeed: 0
                })
                break;
            }
        }
    })

    function closeApp() {
        electron.ipcRenderer.sendMessage('close-app', []);
    }

    function minimizeApp() {
        electron.ipcRenderer.sendMessage('minimize-app', []);
    }

    return (
        <div className="h-screen w-screen bg-[#191919]">
            <DownloadURL showWindow={downloadURLWindow} setShowWindow={setDownloadURLWindow} />
            <DownloadYoutube showWindow={downloadYoutubeWindow} setShowWindow={setDownloadYoutubeWindow} />
            <div className="w-full h-16 flex justify-end items-center draggable">
                <div className="h-full px-5 flex">
                    <div className="h-8 pt-6">
                        <div className="h-full flex justify-center items-center gap-3">
                            <button className="w-3 h-3 bg-green-500 hover:bg-green-400 rounded-full no-drag"></button>
                            <button onClick={minimizeApp} className="w-3 h-3 bg-yellow-500 hover:bg-yellow-400 rounded-full no-drag"></button>
                            <button onClick={closeApp} className="w-3 h-3 bg-red-500 hover:bg-red-400 rounded-full no-drag"></button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full h-16 flex-grow flex items-center px-4">
                <div className="h-full w-full group flex items-center no-drag ga">
                    <button onClick={() => setDownloadURLWindow(true)} className="rounded-r-none h-[65%] w-24 bg-[#2d2d2d] hover:bg-[#373737] flex justify-center items-center rounded">
                        <i className="bi bi-plus-lg text-xl text-[#4a4a4a]"></i>
                    </button>
                    <button onClick={() => setDownloadYoutubeWindow(true)} className="rounded-none h-[65%] w-24 bg-[#2d2d2d] hover:bg-[#373737] flex justify-center items-center">
                        <i className="bi bi-youtube text-xl text-[#4a4a4a]"></i>
                    </button>
                    <button onClick={() => setDownloadURLWindow(true)} className="rounded-none h-[65%] w-24 bg-[#2d2d2d] hover:bg-[#373737] flex justify-center items-center">
                        <i className="bi bi-magnet-fill text-lg text-[#4a4a4a] transform rotate-45"></i>
                    </button>
                    <button onClick={() => window.open("https://github.com/repyh/download-manager")} className="rounded-l-none h-[65%] w-24 bg-[#2d2d2d] hover:bg-[#373737] flex justify-center items-center rounded">
                        <i className="bi bi-box-arrow-up-right text-lg text-[#4a4a4a] transform"></i>
                    </button>
                    <div className="h-full w-[calc(100%-(4*6rem))] flex flex-row-reverse items-center gap-2">
                        <button className="hover:bg-[#262626] h-9 w-9 flex justify-center items-center rounded-full">
                            <i className="bi bi-gear-fill text-[#4a4a4a] text-xl"></i>
                        </button>
                        <button className="hover:bg-[#262626] h-9 w-9 flex justify-center items-center rounded-full">
                            <i className="bi bi-arrow-up-right text-[#4a4a4a] text-xl"></i>
                        </button>
                        <button className="hover:bg-[#262626] h-9 w-9 flex justify-center items-center rounded-full">
                            <i className="bi bi-file-earmark-arrow-down-fill text-[#4a4a4a] text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-full px-4 h-[2px]">
                <div className="w-full h-full bg-[#2d2d2d]"></div>
            </div>
            <div className="w-full px-4 mt-5">
                {Array.from(downloads).map(([key, value]) => {
                    const {type, fileName, fileType, fileSize, totalProgress, finished, status, downloadSpeed} = value;
                    let statusColor;

                    console.log(typeof downloadSpeed)

                    switch(status) {
                        case 'starting':
                            statusColor = 'bg-yellow-600';
                            break;
                        case 'downloading':
                            statusColor = 'bg-blue-600';
                            break;
                        case 'finished':
                            statusColor = 'bg-green-600';
                            break;
                        default:
                            statusColor = 'bg-yellow-600';
                            break;
                    }

                    let displayDownload = `${(totalProgress * 100).toFixed(2)}% Downloaded (${downloadSpeed.toFixed(2)}MB/s)`;

                    switch(true) {
                        case totalProgress <= 0:
                            displayDownload = 'Preparing';
                            break;
                        case totalProgress >= 1 && !finished:
                            displayDownload = 'Repacking'
                            break;
                        case finished:
                            displayDownload = 'Finished'
                            break;
                    }

                    return (
                        <div key={`${type}/${fileName}/${fileType}`} className="h-28 flex w-full gap-2 hover:bg-[#262626] rounded">
                            <button className="h-full w-12 flex justify-center items-center rounded">
                                <i className="bi bi-list text-[#4a4a4a] text-2xl"></i>
                            </button>
                            <div className="w-full h-full flex-col flex gap-1 py-2">
                                <p className="text-[#A57EFD] nunito text-xs">{type.toUpperCase()} download</p>
                                <div className="flex flex-col">
                                    <div className="flex gap-2 items-center">
                                        <h1 className="text-gray-200 inter">{fileName}</h1>
                                        <div className={`text-sm flex justify-center items-center ${statusColor} text-[#191919] w-2 h-[80%] rounded`}></div>
                                    </div>
                                    <p className="text-gray-300 nunito text-xs">File type: {fileType}</p>
                                    <p className="text-gray-300 nunito text-xs">Download size: 1000mb</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1/2 h-1 bg-[#4a4a4a] rounded-full overflow-clip">
                                        <div style={{ width: `${totalProgress*100}%` }} className={`h-full ${finished ? 'bg-green-600' : 'bg-[#A57EFD]'}`}></div>
                                    </div>
                                    <p className="nunito text-xs text-gray-300">{displayDownload}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}