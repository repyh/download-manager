import { useState, useEffect } from 'react';

interface SettingsProps {
    showWindow: boolean;
    setShowWindow: React.Dispatch<React.SetStateAction<boolean>>;
}

interface TabConfig {
    id: string;
    label: string;
    icon: string;
}

export default function Settings({ showWindow, setShowWindow }: SettingsProps) {
    const [activeTab, setActiveTab] = useState('general');
    const [maxThreads, setMaxThreads] = useState(8);
    const [downloadDir, setDownloadDir] = useState('C:/Downloads');
    const [theme, setTheme] = useState('light');
    const [startWithWindows, setStartWithWindows] = useState(true);
    const [showNotifications, setShowNotifications] = useState(true);

    useEffect(() => {
        window.electron.ipcRenderer.once('max-threads-retrieve', (arg: any) => {
            setMaxThreads(parseInt(arg));
        });

        window.electron.ipcRenderer.once('download-path-retrieve', (arg: any) => {
            setDownloadDir(localStorage.getItem('download-default-location') ?? arg);
        })

        window.electron.ipcRenderer.sendMessage('get-max-threads', []);
        window.electron.ipcRenderer.sendMessage('get-download-path', []);
    }, []);

    // Define tabs for the settings window
    const tabs: TabConfig[] = [
        { id: 'general', label: 'General', icon: 'bi-gear' },
        // { id: 'downloads', label: 'Downloads', icon: 'bi-cloud-download' },
        // { id: 'appearance', label: 'Appearance', icon: 'bi-palette' },
        // { id: 'advanced', label: 'Advanced', icon: 'bi-sliders' }
    ];

    function closePopup() {
        setShowWindow(false);
    }

    function saveDownloadLocation() {
        const DOWNLOAD_STORAGE_KEY = "download-default-location";
        localStorage.setItem(DOWNLOAD_STORAGE_KEY, downloadDir);
    }

    function saveSettings() {
        // save settings
        saveDownloadLocation();

        closePopup();
    }

    function directorySearch() {
        window.electron.selectFolder().then((res: string) => {
            setDownloadDir(res);
        });
    }

    return (
        <>
            {/* Modal backdrop */}
            <div
                className={`fixed z-30 inset-0 bg-black ${showWindow ? 'opacity-50' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}
                onClick={closePopup}
            ></div>

            {/* Settings dialog */}
            <div className={`fixed z-50 inset-0 flex items-center justify-center transition-transform duration-200 ${showWindow ? 'scale-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
                <div className="w-[700px] bg-white rounded-xl shadow-xl overflow-hidden transform transition-all">
                    {/* Header */}
                    <div className="px-6 py-4 bg-[#1e40af] text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <i className="bi bi-gear text-xl"></i>
                            </div>
                            <h2 className="text-lg font-semibold nunito">Settings</h2>
                        </div>
                        <button
                            onClick={closePopup}
                            className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="bg-gray-50 border-b border-gray-200">
                        <div className="flex">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'text-[#1e40af] border-b-2 border-[#1e40af]'
                                            : 'text-gray-600 hover:text-[#1e40af] hover:bg-gray-100'
                                        }`}
                                >
                                    <i className={`bi ${tab.icon}`}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Default Download Location</h3>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex gap-2">
                                            <input
                                                disabled
                                                value={downloadDir}
                                                className="w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500"
                                                type="text"
                                            />
                                            <button
                                                onClick={directorySearch}
                                                className="h-10 w-10 rounded-lg bg-white border border-gray-300 hover:border-[#1e40af] hover:text-[#1e40af] text-gray-500 flex items-center justify-center transition-colors"
                                            >
                                                <i className="bi bi-folder-symlink"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'downloads' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Download Behavior</h3>
                                    <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                                        
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Theme Settings</h3>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <label className="block text-sm text-gray-700 mb-1">Application theme</label>
                                        <select
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            className="w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:border-[#1e40af] focus:ring focus:ring-[#1e40af]/20 focus:outline-none"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="system">Use system setting</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'advanced' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h3>
                                    <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">Request timeout (seconds)</label>
                                            <input
                                                type="number"
                                                min="5"
                                                max="120"
                                                defaultValue="30"
                                                className="w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:border-[#1e40af] focus:ring focus:ring-[#1e40af]/20 focus:outline-none"
                                            />
                                        </div>

                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="rounded border-gray-300 text-[#1e40af] focus:ring-[#1e40af] h-4 w-4"
                                            />
                                            <span className="text-sm text-gray-700">Keep download history</span>
                                        </label>

                                        <button className="w-full text-center py-2 text-sm text-white bg-red-300 rounded-lg hover:bg-red-500 transition-colors">
                                            Clear Application Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer with action buttons */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            onClick={closePopup}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveSettings}
                            className="px-4 py-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <i className="bi bi-check-lg"></i>
                            Apply Settings
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
