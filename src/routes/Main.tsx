import DownloadURL from "../popups/DownloadURL";
import Settings from "../popups/Settings";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import throttle from 'lodash.throttle';
import { HistoryView } from "../components/history";

// Define interface for DownloadItem props
interface DownloadItemProps {
    downloadKey: string;
    downloadData: {
        type: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        totalProgress: number;
        finished: boolean;
        status: string;
        downloadSpeed: number;
    };
    formatFileSize: (bytes: number) => string;
}

// DownloadItem component - memoized to prevent unnecessary re-renders
const DownloadItem = memo(({ downloadKey, downloadData, formatFileSize }: DownloadItemProps) => {
    const { type, fileName, fileType, fileSize, totalProgress, finished, status, downloadSpeed } = downloadData;
    let statusColor, statusIcon, statusBg;
    // Status text to display next to the file name
    let statusText = status.charAt(0).toUpperCase() + status.slice(1);

    // Update the switch statement to prioritize the 'finished' state
    if (finished) {
        statusColor = 'text-emerald-600';
        statusBg = 'bg-emerald-100';
        statusIcon = 'bi-check-circle-fill';
        statusText = 'Finished'; // Ensure the status text shows "Finished"
    } else {
        switch (status) {
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
            default:
                statusColor = 'text-amber-600';
                statusBg = 'bg-amber-100';
                statusIcon = 'bi-hourglass-split';
                break;
        }
    }

    let displayDownload = `${(totalProgress * 100).toFixed(2)}% Downloaded (${downloadSpeed.toFixed(2)}MB/s)`;

    switch (true) {
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
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
        >
            <div
                className={`h-1 ${finished ? 'bg-emerald-500' : 'bg-[#1e40af]'}`}
                style={{ width: `${totalProgress * 100}%` }}
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
                                    {statusText}
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
                            style={{ width: `${totalProgress * 100}%` }}
                            className={`h-full transition-all duration-300 ${finished ? 'bg-emerald-500' : 'bg-[#1e40af]'}`}
                        ></div>
                    </div>
                    <p className="text-gray-500 text-xs text-right mt-1">{displayDownload}</p>
                </div>
            </div>
        </div>
    );
});

// Define interface for HistoryItem props
interface HistoryItemProps {
    download: {
        type: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        completedAt: string;
        id: string;
    };
    index: number;
    formatFileSize: (bytes: number) => string;
    formatDate: (dateString: string) => string;
}

// HistoryItem component - memoized to prevent unnecessary re-renders
const HistoryItem = memo(({ download, index, formatFileSize, formatDate }: HistoryItemProps) => {
    return (
        <tr className={`text-gray-700 border-b border-gray-200 ${index % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 transition-colors`}>
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
    );
});

export default function Main() {
    const { electron } = window;
    const [downloadURLWindow, setDownloadURLWindow] = useState(false);
    const [settingsWindow, setSettingsWindow] = useState(false);
    const [downloads, setDownloads] = useState(new Map());
    const [fetchedURL, setFetchedURL] = useState('');
    const [activeView, setActiveView] = useState('downloads'); // 'downloads' or 'history'
    const [completedDownloads, setCompletedDownloads] = useState<Array<any>>([]);
    const [downloadPath, setDownloadPath] = useState<string>('');
    const [notificationSettings, setNotificationSettings] = useState({
        enabled: true, // Default to enabled
        sound: true,   // Default sound to enabled
    });

    // localStorage keys
    const STORAGE_KEY = 'download-manager-history';
    const DOWNLOAD_PATH_KEY = 'download-default-location';
    const NOTIFICATION_SETTINGS_KEY = 'download-notification-settings';

    // Get download path from localStorage
    const getDownloadPath = useCallback(() => {
        return localStorage.getItem(DOWNLOAD_PATH_KEY) || '';
    }, []);

    // Load download history from localStorage on component mount
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(STORAGE_KEY);
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                if (Array.isArray(parsedHistory)) {
                    setCompletedDownloads(parsedHistory);
                }
            }

            // Get the download path from localStorage
            const path = getDownloadPath();
            setDownloadPath(path);
            
            // Get the notification settings from localStorage
            const storedNotificationSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
            if (storedNotificationSettings) {
                const parsedSettings = JSON.parse(storedNotificationSettings);
                setNotificationSettings(parsedSettings);
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
        }
    }, [getDownloadPath]);

    // Debounced function to save to localStorage (prevents excessive writes)
    const debouncedSaveToStorage = useCallback(
        throttle((data: any[]) => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch (error) {
                console.error('Failed to save download history to localStorage:', error);
            }
        }, 1000),
        []
    );

    // Save to localStorage whenever completedDownloads changes
    useEffect(() => {
        if (completedDownloads.length > 0) {
            debouncedSaveToStorage(completedDownloads);
        }
        return () => {
            debouncedSaveToStorage.cancel(); // Cancel any pending save on unmount
        };
    }, [completedDownloads, debouncedSaveToStorage]);

    // Use useCallback to memoize functions that don't need to be recreated every render
    const updateDownloads = useCallback((key: any, newProperty: any) => {
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
    }, []);

    // Create a single throttled update function that persists across renders
    const throttledUpdateDownloads = useCallback(
        throttle((key: any, newProperty: any) => {
            updateDownloads(key, newProperty);
        }, 1000),
        [updateDownloads]
    );

    const addDownload = useCallback((key: any, value: any) => {
        setDownloads((prev) => new Map(prev).set(key, value));
    }, []);

    const removeDownload = useCallback((key: any) => {
        setDownloads((prev) => {
            const newD = new Map(prev);
            newD.delete(key);
            return newD;
        });
    }, []);

    // Format utility functions
    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    // UI action handlers
    const closeApp = useCallback(() => {
        electron.ipcRenderer.sendMessage('close-app', []);
    }, [electron]);

    const minimizeApp = useCallback(() => {
        electron.ipcRenderer.sendMessage('minimize-app', []);
    }, [electron]);

    const maximizeApp = useCallback(() => {
        electron.ipcRenderer.sendMessage('maximize-app', []);
    }, [electron]);

    // Setup event listeners once on component mount
    useEffect(() => {
        const fileDownloadHandler = (payload: any) => {
            console.log(payload);
            setFetchedURL(payload.finalUrl);
            setDownloadURLWindow(true);
        };

        const downloadProgressHandler = (response: any) => {
            switch (response[0]) {
                case 'file': {
                    const [type, fileName, fileType, fileSize, workerId, progress, totalProgress, workerSpeeds] = response as ['file' | 'youtube', string, string, number, number, number, number, Array<number>];
                    const downloadSpeed = workerSpeeds.reduce((acc, curr) => acc + curr, 0) / workerSpeeds.length / 1024;

                    // Use the pre-created throttled function instead of creating a new one every time
                    throttledUpdateDownloads(`${fileName}/${fileType}`, {
                        totalProgress,
                        fileType,
                        status: 'downloading',
                        downloadSpeed
                    });
                    break;
                }
            }
        };

        const downloadFinishedHandler = (res: any) => {
            switch (res[0]) {
                case 'file': {
                    const [type, fileName, fileType, fileSize, oldType] = res as ['file' | 'youtube', string, string, number, string];
                    updateDownloads(`${fileName}/${oldType}`, {
                        fileType,
                        finished: true,
                        status: 'finished'
                    });

                    // Add to completed downloads history - check for duplicates first
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

                        // Add new download to the beginning of the array
                        const newHistory = [download, ...prev];

                        // Update localStorage with the new history (done via useEffect)
                        return newHistory;
                    });
                    
                    // Send notification if enabled in settings
                    if (notificationSettings.enabled) {
                        electron.ipcRenderer.sendMessage('emit-notification', ['Download Complete', `${fileName}.${fileType} has been downloaded successfully.`]);
                    }
                    break;
                }
            }
        };

        const downloadStartingHandler = (res: any) => {
            switch (res[0]) {
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
                    });
                    break;
                }
            }
        };

        // Add event listeners and store the cleanup functions
        const removeFileDownloadListener = window.electron.ipcRenderer.on('file-download', fileDownloadHandler);
        const removeProgressListener = window.electron.ipcRenderer.on('download-progress', downloadProgressHandler);
        const removeFinishedListener = window.electron.ipcRenderer.on('download-finished', downloadFinishedHandler);
        const removeStartingListener = window.electron.ipcRenderer.on('download-starting', downloadStartingHandler);

        // Listen for download path changes from settings
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === DOWNLOAD_PATH_KEY) {
                const newPath = getDownloadPath();
                if (newPath !== downloadPath) {
                    setDownloadPath(newPath);
                }
            } else if (event.key === NOTIFICATION_SETTINGS_KEY) {
                try {
                    const newSettings = event.newValue ? JSON.parse(event.newValue) : {
                        enabled: true,
                        sound: true
                    };
                    setNotificationSettings(newSettings);
                } catch (error) {
                    console.error('Failed to parse notification settings:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup function to remove event listeners
        return () => {
            // Call the cleanup functions returned by the 'on' method
            removeFileDownloadListener();
            removeProgressListener();
            removeFinishedListener();
            removeStartingListener();
            window.removeEventListener('storage', handleStorageChange);

            // Cancel any pending throttled calls
            throttledUpdateDownloads.cancel();
        };
    }, [addDownload, throttledUpdateDownloads, updateDownloads, downloadPath, getDownloadPath, notificationSettings, electron]);

    // Memoize download list to prevent unnecessary re-renders
    const downloadsList = useMemo(() => {
        return Array.from(downloads).map(([key, value]) => (
            <DownloadItem
                key={key}
                downloadKey={key}
                downloadData={value}
                formatFileSize={formatFileSize}
            />
        ));
    }, [downloads, formatFileSize]);

    // Add a function to clear history if needed
    const clearDownloadHistory = useCallback(() => {
        setCompletedDownloads([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear download history from localStorage:', error);
        }
    }, []);

    // Add function to remove a single item from history
    const removeHistoryItem = useCallback((id: string) => {
        setCompletedDownloads(prev => {
            const filteredHistory = prev.filter(item => item.id !== id);
            
            // Update localStorage directly for immediate persistence
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
            } catch (error) {
                console.error('Failed to update localStorage after removing item:', error);
            }
            
            return filteredHistory;
        });
    }, []);

    return (
        <div className="h-screen w-screen bg-[#f8fafc] flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-20 h-full bg-[#1e40af] flex flex-col items-center py-6 border-r border-[#2563eb]/20">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-10">
                    <img src="https://raw.githubusercontent.com/repyh/download-manager/refs/heads/main/assets/strobe_logo.png" alt="Strobe Logo" className="w-8 h-8" />
                </div>

                <div className="flex flex-col items-center gap-6 flex-1">
                    <button
                        onClick={() => setActiveView('downloads')}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${activeView === 'downloads'
                                ? 'bg-white text-[#1e40af]'
                                : 'text-white/70 hover:text-white hover:bg-[#2563eb]/30'
                            }`}
                    >
                        <i className="bi bi-arrow-down-circle text-xl"></i>
                    </button>

                    {/* <button
                        onClick={() => window.open("https://github.com/repyh/download-manager")}
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-[#2563eb]/30 transition-all"
                    >
                        <i className="bi bi-magnet text-xl"></i>
                    </button> */}

                    <button
                        onClick={() => setActiveView('history')}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${activeView === 'history'
                                ? 'bg-white text-[#1e40af]'
                                : 'text-white/70 hover:text-white hover:bg-[#2563eb]/30'
                            }`}
                    >
                        <i className="bi bi-clock-history text-xl"></i>
                    </button>

                    <button
                        onClick={() => window.open("https://github.com/repyh/download-manager")}
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-[#2563eb]/30 transition-all relative group"
                    >
                        <i className="bi bi-github text-xl"></i>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                            <i className="bi bi-arrow-up-right text-[0.55rem] text-[#1e40af]"></i>
                        </div>
                    </button>
                </div>

                <button
                    onClick={() => setSettingsWindow(true)}
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
                        <div className="flex items-center gap-3 no-drag">
                            <button
                                onClick={minimizeApp}
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 hover:text-[#1e40af] transition-colors"
                                title="Minimize"
                            >
                                <i className="bi bi-dash text-lg"></i>
                            </button>
                            <button
                                onClick={maximizeApp}
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 hover:text-[#1e40af] transition-colors"
                                title="Maximize"
                            >
                                <i className="bi bi-fullscreen text-lg"></i>
                            </button>
                            <button
                                onClick={closeApp}
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                                title="Close"
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
                            {downloadsList}

                            {downloads.size === 0 && (
                                <div className="flex flex-col items-center justify-center h-96">
                                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                                        <i className="bi bi-cloud-download text-6xl text-[#1e40af]"></i>
                                    </div>
                                    <h2 className="text-gray-800 nunito font-bold text-xl mb-2">No active downloads</h2>
                                    <p className="text-gray-500 inter mb-6">Start a new download to see it here</p>
                                    <button
                                        onClick={() => setDownloadURLWindow(true)}
                                        className="px-6 py-3 bg-[#1e40af] text-white rounded-lg hover:bg-[#1e3a8a] transition-colors flex items-center gap-2 nunito font-medium"
                                    >
                                        <i className="bi bi-plus"></i>
                                        <span>Start a download</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* History View - Using the modularized component */}
                    {activeView === 'history' && (
                        <HistoryView 
                            completedDownloads={completedDownloads}
                            formatFileSize={formatFileSize}
                            formatDate={formatDate}
                            clearDownloadHistory={clearDownloadHistory}
                            setActiveView={setActiveView}
                            setDownloadURLWindow={setDownloadURLWindow}
                            removeHistoryItem={removeHistoryItem}
                        />
                    )}
                </div>
            </div>

            {/* Download URL dialog */}
            <DownloadURL
                openURL={fetchedURL}
                showWindow={downloadURLWindow}
                setShowWindow={setDownloadURLWindow}
                downloadPath={downloadPath}
            />

            {/* Settings dialog */}
            <Settings
                showWindow={settingsWindow}
                setShowWindow={setSettingsWindow}
                // notificationSettings={notificationSettings}
                // notificationSettingsKey={NOTIFICATION_SETTINGS_KEY}
            />
        </div>
    );
}