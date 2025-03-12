import DownloadURL from "../popups/DownloadURL";
import { useState, useEffect } from "react";
import throttle from 'lodash.throttle';

export default function Main() {
    const { electron } = window;
    const [downloadURLWindow, setDownloadURLWindow] = useState(false);
    const [downloads, setDownloads] = useState(new Map());
    const [fetchedURL, setFetchedURL] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [activeView, setActiveView] = useState('downloads'); // 'downloads' or 'history'
    const [completedDownloads, setCompletedDownloads] = useState<Array<any>>([]);

    const updateDownloads = (key: any, newProperty: any) => {
        console.log(key, newProperty)
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

    window.electron.ipcRenderer.on('file-download', (payload: any) => {
        console.log(payload);
        setFetchedURL(payload.finalUrl);
        setDownloadURLWindow(true);
    })

    window.electron.ipcRenderer.on('download-progress', (response: any) => {
        switch(response[0]) {
            case 'file': {
                const [type, fileName, fileType, fileSize, workerId, progress, totalProgress, workerSpeeds] = response as ['file' | 'youtube', string, string, number, number, number, number, Array<number>];
                const downloadSpeed = workerSpeeds.reduce((acc, curr) => acc + curr, 0) / workerSpeeds.length / 1024;

                const throttleUpdate = throttle(updateDownloads, 1000);
                throttleUpdate(`${fileName}/${fileType}`, {
                    totalProgress,
                    fileType,
                    status: 'downloading',
                    downloadSpeed
                });

                break;
            }
        }
    })

    window.electron.ipcRenderer.on('download-finished', (res: any) => {
        switch(res[0]) {
            case 'file': {
                const [type, fileName, fileType, fileSize, oldType] = res as ['file' | 'youtube', string, string, number, string];
                updateDownloads(`${fileName}/${oldType}`, {
                    fileType,
                    finished: true,
                    status: 'finished'
                });
                
                // Add to completed downloads history - check for duplicates first
                const newDownloadId = `${fileName}/${fileType}`;
                setCompletedDownloads(prev => {
                    // Check if we already have this download in history
                    const existingDownload = prev.find(d => 
                        d.fileName === fileName && 
                        (d.fileType === fileType || d.fileType === oldType)
                    );
                    
                    // If it exists, don't add it again
                    if (existingDownload) {
                        return prev;
                    }
                    
                    // Otherwise add the new download to history
                    const download = {
                        type,
                        fileName,
                        fileType,
                        fileSize,
                        completedAt: new Date().toISOString(),
                        id: `${fileName}/${oldType}_${Date.now()}`
                    };
                    
                    return [download, ...prev];
                });
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

    function formatFileSize(bytes: number) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    return (
        <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-20 h-full bg-[#1e40af] flex flex-col items-center py-6 border-r border-[#2563eb]/20">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-10">
                    <i className="bi bi-cloud-download text-[#1e40af] text-xl"></i>
                </div>
                
                <div className="flex flex-col items-center gap-6 flex-1">
                    <button 
                        onClick={() => setActiveView('downloads')}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                            activeView === 'downloads' 
                                ? 'bg-white text-[#1e40af]' 
                                : 'text-white/70 hover:text-white hover:bg-[#2563eb]/30'
                        }`}
                    >
                        <i className="bi bi-arrow-down-circle text-xl"></i>
                    </button>
                    
                    <button 
                        onClick={() => setActiveView('history')}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                            activeView === 'history' 
                                ? 'bg-white text-[#1e40af]' 
                                : 'text-white/70 hover:text-white hover:bg-[#2563eb]/30'
                        }`}
                    >
                        <i className="bi bi-clock-history text-xl"></i>
                    </button>
                    
                    <button 
                        onClick={() => window.open("https://github.com/repyh/download-manager")}
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-[#2563eb]/30 transition-all"
                    >
                        <i className="bi bi-github text-xl"></i>
                    </button>
                </div>
                
                <button 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-[#2563eb]/30 transition-all"
                >
                    <i className="bi bi-gear text-xl"></i>
                </button>
            </div>
            
            {/* Main content */}
            <div className="flex-1 flex flex-col h-full">
                {/* Custom titlebar */}
                <div className="h-16 bg-white draggable flex justify-between items-center px-6 border-b border-gray-200 shadow-sm">
                    <h1 className="text-[#1e3a8a] nunito font-bold text-lg">
                        {activeView === 'downloads' ? 'Active Downloads' : 'Download History'}
                    </h1>
                    
                    <div className="flex items-center gap-4">
                        {activeView === 'downloads' && (
                            <button 
                                onClick={() => setDownloadURLWindow(true)}
                                className="px-4 py-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg no-drag transition-all flex items-center gap-2"
                            >
                                <i className="bi bi-plus"></i>
                                <span>New Download</span>
                            </button>
                        )}
                        
                        <div className="flex items-center gap-3 no-drag">
                            <button 
                                onClick={minimizeApp} 
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 hover:text-[#1e40af] transition-colors"
                            >
                                <i className="bi bi-dash text-lg"></i>
                            </button>
                            <button 
                                onClick={closeApp} 
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Content area */}
                <div className="flex-1 overflow-auto p-6 bg-[#f0f5ff]">
                    {/* Downloads View */}
                    {activeView === 'downloads' && (
                        <div className="space-y-4">
                            {Array.from(downloads).map(([key, value]) => {
                                const {type, fileName, fileType, fileSize, totalProgress, finished, status, downloadSpeed} = value;
                                let statusColor, statusIcon, statusBg;

                                switch(status) {
                                    case 'starting':
                                        statusColor = 'text-amber-600';
                                        statusBg = 'bg-amber-100';
                                        statusIcon = 'bi-hourglass-split';
                                        break;
                                    case 'downloading':
                                        statusColor = 'text-[#1e40af]';
                                        statusBg = 'bg-blue-100';
                                        statusIcon = 'bi-arrow-down-circle-fill';
                                        break;
                                    case 'finished':
                                        statusColor = 'text-emerald-600';
                                        statusBg = 'bg-emerald-100';
                                        statusIcon = 'bi-check-circle-fill';
                                        break;
                                    default:
                                        statusColor = 'text-amber-600';
                                        statusBg = 'bg-amber-100';
                                        statusIcon = 'bi-hourglass-split';
                                        break;
                                }

                                let displayDownload = `${(totalProgress * 100).toFixed(2)}% Downloaded (${downloadSpeed.toFixed(2)}MB/s)`;

                                switch(true) {
                                    case totalProgress <= 0:
                                        displayDownload = 'Preparing';
                                        break;
                                    case totalProgress >= 1 && !finished:
                                        displayDownload = 'Repacking';
                                        break;
                                    case finished:
                                        displayDownload = 'Finished';
                                        break;
                                }

                                return (
                                    <div 
                                        key={`${type}/${fileName}/${fileType}`} 
                                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div 
                                            className={`h-1 ${finished ? 'bg-emerald-500' : 'bg-[#1e40af]'}`} 
                                            style={{ width: `${totalProgress*100}%` }}
                                        >
                                        </div>
                                        
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-start">
                                                    <div className={`flex items-center justify-center h-12 w-12 rounded-lg ${statusBg} ${statusColor} p-2`}>
                                                        <i className={`bi ${statusIcon} text-2xl`}></i>
                                                    </div>
                                                    
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h2 className="text-gray-800 inter font-semibold text-lg">{fileName}</h2>
                                                            <span className={`px-2 py-0.5 rounded-md ${statusBg} ${statusColor} text-xs font-medium`}>
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </span>
                                                        </div>
                                                        <p className="text-[#1e40af] nunito text-xs font-medium mt-0.5">{type.toUpperCase()} DOWNLOAD</p>
                                                    </div>
                                                </div>
                                                
                                                {!finished && (
                                                    <div className="flex items-center">
                                                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 p-2 rounded transition-all">
                                                            <i className="bi bi-x-lg"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <p className="text-gray-500 text-xs">File Type</p>
                                                    <p className="text-gray-700 text-sm font-medium">{fileType}</p>
                                                </div>
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <p className="text-gray-500 text-xs">Size</p>
                                                    <p className="text-gray-700 text-sm font-medium">{formatFileSize(fileSize)}</p>
                                                </div>
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <p className="text-gray-500 text-xs">Speed</p>
                                                    <p className="text-gray-700 text-sm font-medium">
                                                        {finished ? 'Completed' : `${downloadSpeed.toFixed(2)} MB/s`}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-gray-500 text-xs">Progress</p>
                                                    <p className="text-gray-700 text-xs font-medium">{(totalProgress * 100).toFixed(1)}%</p>
                                                </div>
                                                <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden">
                                                    <div 
                                                        style={{ width: `${totalProgress*100}%` }} 
                                                        className={`h-full transition-all duration-300 ${finished ? 'bg-emerald-500' : 'bg-[#1e40af]'}`}
                                                    ></div>
                                                </div>
                                                <p className="text-gray-500 text-xs text-right mt-1">{displayDownload}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            
                            {downloads.size === 0 && (
                                <div className="flex flex-col items-center justify-center h-96">
                                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                        <i className="bi bi-cloud-download text-6xl text-[#1e40af]"></i>
                                    </div>
                                    <h2 className="text-gray-800 nunito font-bold text-xl mb-2">No active downloads</h2>
                                    <p className="text-gray-500 nunito mb-6">Start a new download to see it here</p>
                                    <button 
                                        onClick={() => setDownloadURLWindow(true)}
                                        className="px-6 py-3 bg-[#1e40af] text-white rounded-lg hover:bg-[#1e3a8a] transition-colors flex items-center gap-2"
                                    >
                                        <i className="bi bi-plus"></i>
                                        <span>Start a download</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* History View */}
                    {activeView === 'history' && (
                        <div className="flex flex-col h-full">
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-gray-800 font-medium">Total Downloads</h3>
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1e40af] flex items-center justify-center">
                                            <i className="bi bi-download"></i>
                                        </div>
                                    </div>
                                    <p className="text-3xl text-gray-800 font-bold">{completedDownloads.length}</p>
                                </div>
                                
                                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-gray-800 font-medium">Storage Used</h3>
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <i className="bi bi-hdd"></i>
                                        </div>
                                    </div>
                                    <p className="text-3xl text-gray-800 font-bold">
                                        {formatFileSize(completedDownloads.reduce((acc, dl) => acc + (dl.fileSize || 0), 0))}
                                    </p>
                                </div>
                                
                                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-gray-800 font-medium">Last Download</h3>
                                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                            <i className="bi bi-clock-history"></i>
                                        </div>
                                    </div>
                                    <p className="text-lg text-gray-800 font-medium">
                                        {completedDownloads.length > 0 
                                            ? formatDate(completedDownloads[0].completedAt) 
                                            : 'No downloads yet'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex-1">
                                <div className="p-5 border-b border-gray-200">
                                    <h2 className="text-gray-800 text-lg font-bold">Download History</h2>
                                    <p className="text-gray-500 text-sm">Browse your completed downloads</p>
                                </div>
                                
                                {completedDownloads.length > 0 ? (
                                    <div className="overflow-auto max-h-[calc(100vh-320px)]">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                                <tr>
                                                    <th className="px-6 py-3">File Name</th>
                                                    <th className="px-6 py-3">Type</th>
                                                    <th className="px-6 py-3">Size</th>
                                                    <th className="px-6 py-3">Date</th>
                                                    <th className="px-6 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {completedDownloads.map((download, index) => (
                                                    <tr key={download.id} className={`text-gray-700 border-b border-gray-200 ${index % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 transition-colors`}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded bg-blue-100 text-[#1e40af] flex items-center justify-center">
                                                                    <i className={`bi ${download.type === 'youtube' ? 'bi-youtube' : 'bi-file-earmark'}`}></i>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-800">{download.fileName}</p>
                                                                    <p className="text-xs text-gray-500">.{download.fileType}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className="px-2 py-1 rounded-full bg-blue-100 text-[#1e40af] text-xs">
                                                                {download.type.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">{formatFileSize(download.fileSize)}</td>
                                                        <td className="px-6 py-4 text-sm">{formatDate(download.completedAt)}</td>
                                                        <td className="px-6 py-4 text-sm text-right">
                                                            <button className="text-gray-500 hover:text-[#1e40af]">
                                                                <i className="bi bi-three-dots-vertical"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                            <i className="bi bi-clock-history text-3xl text-[#1e40af]"></i>
                                        </div>
                                        <h3 className="text-gray-800 font-medium text-lg mb-2">No download history</h3>
                                        <p className="text-gray-500 text-sm mb-6">Completed downloads will appear here</p>
                                        <button 
                                            onClick={() => {
                                                setActiveView('downloads');
                                                setDownloadURLWindow(true);
                                            }}
                                            className="px-4 py-2 bg-[#1e40af] text-white rounded-lg hover:bg-[#1e3a8a] transition-colors"
                                        >
                                            Start a new download
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Download URL dialog */}
            <DownloadURL openURL={fetchedURL} showWindow={downloadURLWindow} setShowWindow={setDownloadURLWindow} />
        </div>
    );
}