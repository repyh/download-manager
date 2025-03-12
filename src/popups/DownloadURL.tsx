import { useState, useEffect } from 'react';

export default function DownloadURL({ openURL, showWindow = false, setShowWindow }: { openURL: string, showWindow: boolean, setShowWindow: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [threads, setThreads] = useState(1);
    const [maxThreads, setMaxThreads] = useState(1);
    const [fileName, setFileName] = useState('default');
    const [downloadURL, setDownloadURL] = useState('');
    const [loading, setLoading] = useState(false);

    window.electron.ipcRenderer.once('max-threads-retrieve', (arg: any) => {
        setMaxThreads(parseInt(arg));
    });

    window.electron.ipcRenderer.once('download-starting', () => {
        setLoading(false);
        closePop();
    })

    useEffect(() => {
        // console.log('testa', openURL);
        window.electron.ipcRenderer.sendMessage('get-max-threads', []);
    }, []);

    useEffect(() => {
        if (openURL) {
            setDownloadURL(openURL);
        }
    }, [openURL])

    function startDownload() {
        // closePop();
        setLoading(true);
        window.electron.ipcRenderer.sendMessage('start-download', [
            downloadURL,
            fileName,
            threads
        ]);
        // setShowWindow(false);
    }

    function directorySearch() {
        window.electron.selectFolder().then((res: string) => {
            setFileName(res);
        })
    }

    function onFileNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFileName(e.target.value !== '' ? e.target.value : 'default');
    }

    function onDownloadURLChange(e: React.ChangeEvent<HTMLInputElement>) {
        setDownloadURL(e.target.value);
    }

    function closePop() {
        setShowWindow(false);
        setDownloadURL('');
        setFileName('default');
    }

    function increaseThreads() {
        if (threads < maxThreads) {
            setThreads(threads + 1);
        }
    }

    function decreaseThreads() {
        if (threads > 1) {
            setThreads(threads - 1);
        }
    }

    return (
        <> 
            {/* Loading overlay */}
            <div className={`fixed z-40 inset-0 bg-black ${loading ? 'opacity-50' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}></div>
            
            {/* Modal backdrop */}
            <div 
                className={`fixed z-30 inset-0 bg-black ${showWindow ? 'opacity-50' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}
                onClick={closePop}
            ></div>
            
            {/* Modal dialog */}
            <div className={`fixed z-50 inset-0 flex items-center justify-center transition-transform duration-200 ${showWindow ? 'scale-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
                <div className="w-[36rem] bg-white rounded-xl shadow-xl overflow-hidden transform transition-all">
                    {/* Header */}
                    <div className="px-6 py-4 bg-[#1e40af] text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <i className="bi bi-cloud-download text-xl"></i>
                            </div>
                            <h2 className="text-lg font-semibold nunito">Download from URL</h2>
                        </div>
                        <button 
                            onClick={closePop} 
                            className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    
                    {/* Body */}
                    <div className="p-6 bg-[#f0f5ff]">
                        <div className="space-y-5">
                            {/* URL Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Paste your download URL</label>
                                <input 
                                    value={downloadURL} 
                                    onChange={onDownloadURLChange} 
                                    placeholder="https://download.url/..." 
                                    className="w-full h-10 px-4 py-2 bg-white border border-gray-300 focus:border-[#1e40af] focus:ring focus:ring-[#1e40af]/20 rounded-lg transition-all focus:outline-none" 
                                    type="url" 
                                />
                            </div>
                            
                            {/* Save Directory */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Save directory</label>
                                <div className="flex gap-2">
                                    <input 
                                        disabled 
                                        value={fileName} 
                                        onChange={onFileNameChange} 
                                        placeholder="default" 
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
                            
                            {/* Workers */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Workers</label>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input 
                                            value={threads} 
                                            readOnly
                                            className="w-16 h-10 px-3 py-2 bg-white border border-gray-300 rounded-l-lg text-center text-gray-800 focus:outline-none" 
                                            type="number" 
                                        />
                                        <div className="flex flex-col h-10">
                                            <button 
                                                onClick={increaseThreads} 
                                                className="h-5 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 border-l-0 rounded-tr-lg flex items-center justify-center transition-colors"
                                            >
                                                <i className="bi bi-chevron-up text-xs"></i>
                                            </button>
                                            <button 
                                                onClick={decreaseThreads} 
                                                className="h-5 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 border-l-0 border-t-0 rounded-br-lg flex items-center justify-center transition-colors"
                                            >
                                                <i className="bi bi-chevron-down text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={startDownload} 
                                        className="px-6 py-2.5 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <i className="bi bi-file-earmark-arrow-down"></i>
                                        <span>Download Now</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Help text */}
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex items-start gap-2">
                                <i className="bi bi-info-circle text-[#1e40af] mt-0.5"></i>
                                <div>
                                    <p className="text-xs text-gray-600">
                                        Using more workers can increase download speed for large files, but may not work with all servers.
                                        Maximum number of workers: <span className="font-medium text-[#1e40af]">{maxThreads}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}