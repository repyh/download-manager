import { useState, useEffect } from 'react';

export default function DownloadURL({ showWindow = false, setShowWindow }: { showWindow: boolean, setShowWindow: React.Dispatch<React.SetStateAction<boolean>> }) {
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
        window.electron.ipcRenderer.sendMessage('get-max-threads', []);
    }, []);

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
            <div className={`absolute z-30 w-screen h-screen bg-[#191919] ${loading ? 'opacity-70 scale-100' : 'opacity-0 scale-0 bg-transparent'}}`}></div>
            <div className={`absolute z-10 w-screen h-screen bg-[#191919] ${showWindow ? 'opacity-70 scale-100' : 'opacity-0 scale-0 bg-transparent'}}`}></div>
            <div className={`absolute z-20 w-screen h-screen flex justify-center pt-36 origin-top ${showWindow ? 'scale-100' : 'scale-0'} transition duration-150`}>
                <div className="w-[36rem] h-[22rem] bg-[#2d2d2d] rounded flex flex-col gap-2">
                    <div className="w-full h-20 flex mt-1.5">
                        <div className="w-full h-full text-[#A57EFD] flex items-center pl-6 nunito">
                            <p className="border-b-2 border-[#A57EFD]">Download from URL</p>
                        </div>
                        <button onClick={closePop} className="h-full w-20 flex justify-center items-center">
                            <i className="bi bi-x text-3xl text-[#4A4A4A] hover:text-[#A57EFD]"></i>
                        </button>
                    </div>
                    <div className="w-full h-full px-6">
                        <div className="w-full h-full bg-slate-0 flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <p className="inter text-white text-sm">Paste your download URL</p>
                                <input onChange={onDownloadURLChange} placeholder="https://download.url/..." className="w-full h-10 nunito focus:border-[#A57EFD] bg-[#2d2d2d] border-[#343434] border-2 rounded focus:outline-none text-gray-300 placeholder:italic pl-2 placeholder:opacity-40" type="url" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="inter text-white text-sm">Save directory</p>
                                <div className="flex w-full gap-[1%]">
                                    <input disabled value={fileName} onChange={onFileNameChange} placeholder="default" className="w-[90%] h-10 nunito focus:border-[#A57EFD] bg-[#2d2d2d] border-[#343434] border-2 rounded focus:outline-none text-gray-300 placeholder:italic pl-2 placeholder:opacity-40" type="text" />
                                    <button onClick={directorySearch} className="h-10 w-[9%] hover:border-2 hover:border-[#A57EFD] text-[#4A4A4A] hover:text-[#A57EFD] rounded flex justify-center items-center">
                                        <i className="bi bi-folder-symlink-fill text-md"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="inter text-white text-sm">Workers</p>
                                <div className="w-full h-10 flex">
                                    <div className="w-1/2 h-full">
                                        <div className="w-1/2 h-full flex">
                                            <input value={threads} className="w-2/3 h-full px-2 nunito focus:border-[#A57EFD] bg-[#2d2d2d] border-[#343434] border-2 rounded rounded-r-none focus:outline-none text-gray-300 placeholder:italic pl-2 placeholder:opacity-40 text-end" type="number" />
                                            <div className="w-1/4 h-full flex flex-col">
                                                <button onClick={increaseThreads} className="w-full h-1/2 bg-[#343434] flex items-center justify-center rounded-tr hover:bg-[#4A4A4A]">
                                                    <i className="bi bi-arrow-up-short text-lg text-[#1e1f27] pt-[2px] pr-[2px]"></i>
                                                </button>
                                                <button onClick={decreaseThreads} className="w-full h-1/2 bg-[#343434] flex items-center justify-center rounded-br hover:bg-[#4A4A4A]">
                                                    <i className="bi bi-arrow-down-short text-lg text-[#1e1f27] pt-[2px] pr-[2px]"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-full flex flex-row-reverse">
                                        <div className="group">
                                            <button onClick={startDownload} className="h-full w-24 bg-[#A57EFD] rounded group-hover:bg-[#B88BFD]">
                                                <i className="bi bi-file-earmark-arrow-down-fill text-xl text-[#191919]"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}