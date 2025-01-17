import { format } from 'node:url';
import { useState, useEffect } from 'react';

const formatOptions = [
    { value: '82', label: 'mp4/360p' },
    { value: '83', label: 'mp4/480p' },
    { value: '84', label: 'mp4/720p' },
    { value: '85', label: 'mp4/1080p' },
    { value: '139', label: 'm4a/48k' },
    { value: '140', label: 'm4a/128k' },
    { value: '141', label: 'm4a/256k' },
]

export default function DownloadYoutube({ showWindow = false, setShowWindow }: { showWindow: boolean, setShowWindow: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [itag, setItag] = useState(82);
    const [fileName, setFileName] = useState('default');
    const [downloadURL, setDownloadURL] = useState('');
    const [loading, setLoading] = useState(false);

    const [videoTitle, setVideoTitle] = useState('#title');
    const [videoAuthor, setVideoAuthor] = useState('#author');
    const [likes, setLikes] = useState(0);
    const [views, setViews] = useState(0);

    window.electron.ipcRenderer.once('download-starting', () => {
        setLoading(false);
        closePop();
    })

    window.electron.ipcRenderer.on('video-info-retrieved', (response) => {
        const [title, author, likes, views] = response as [string, string, number, number];
        setVideoTitle(title);
        setVideoAuthor(author);
        setLikes(likes);
        setViews(views);

        setLoading(false);
    })

    function changeOption(e: React.ChangeEvent<HTMLSelectElement>) {
        setItag(parseInt(e.target.value));
    }

    function searchVideo() {
        window.electron.ipcRenderer.sendMessage('get-youtube-info', [downloadURL]);
        setLoading(true);
    }

    function startDownload() {
        // // closePop();
        // setLoading(true);
        // window.electron.ipcRenderer.sendMessage('start-download', [
        //     downloadURL,
        //     fileName, 
        //     threads
        // ]);
        // // setShowWindow(false);
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
        setDownloadURL('');
        setVideoTitle('#title');
        setVideoAuthor('#author');
        setLikes(0);
        setViews(0);

        setShowWindow(false);
        setFileName('default');
    }

    return (
        <> 
            <div className={`absolute z-30 w-screen h-screen bg-[#191919] ${loading ? 'opacity-70 scale-100' : 'opacity-0 scale-0 bg-transparent'}}`}></div>
            <div className={`absolute z-10 w-screen h-screen bg-[#191919] ${showWindow ? 'opacity-70 scale-100' : 'opacity-0 scale-0 bg-transparent'}}`}></div>
            <div className={`absolute z-20 w-screen h-screen flex justify-center pt-24 origin-top ${showWindow ? 'scale-100' : 'scale-0'} transition duration-150`}>
                <div className={`w-[36rem] ${videoTitle !== '#title' && videoAuthor !== '#author' ? 'h-[30rem]' : 'h-[23.5rem]'} bg-[#2d2d2d] rounded flex flex-col gap-2`}>
                    <div className={`w-full h-28 flex ${videoTitle !== '#title' && videoAuthor !== '#author' ? '' : '-mt-2'}`}>
                        <div className="w-full h-full text-[#A57EFD] flex items-center pl-6 nunito">
                            <p className="border-b-2 border-[#A57EFD]">Youtube Video Download</p>
                        </div>
                        <button onClick={closePop} className="h-full w-20 flex justify-center items-center">
                            <i className="bi bi-x text-3xl text-[#4A4A4A] hover:text-[#A57EFD]"></i>
                        </button>
                    </div>
                    {(videoTitle !== '#title' && videoAuthor !== '#author') && (
                        <div className={`w-full h-44 py-[2%] px-6 -mt-2`}>
                            <div className="w-full h-full flex flex-col gap-1">
                                <div className="text-green-500 flex inter items-center w-full text-xs gap-1.5">
                                    <i className="bi bi-info-circle"></i>
                                    <p>Video found</p>
                                </div>
                                <div className="w-full h-full flex flex-col gap-0.5">
                                    <h1 className="text-white nunito text-lg truncate">{videoTitle}</h1>
                                    <p className="text-gray-300 text-xs inter font-light">Uploaded by: {videoAuthor}</p>
                                    <p className="text-gray-300 text-xs inter font-light">Views: {views.toLocaleString()}</p>
                                    <p className="text-gray-300 text-xs inter font-light">Likes: {likes.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="w-full h-full px-6 -mt-2">
                        <div className="w-full h-full bg-slate-0 flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <p className="inter text-white text-sm">Paste Youtube video link</p>
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
                                <p className="inter text-white text-sm">File type</p>
                                <div className="w-full h-10 flex">
                                    <div className="w-2/3 h-full flex">
                                        <select onChange={changeOption} value={itag} className="w-[60%] h-full px-2 nunito focus:border-[#A57EFD] bg-[#2d2d2d] border-[#343434] border-2 rounded focus:outline-none text-gray-300 placeholder:italic pl-2 placeholder:opacity-40">
                                            {formatOptions.map((option) => {
                                                return <option key={option.value} value={option.value}>{option.label}</option>
                                            })}
                                        </select>
                                    </div>
                                    <div className="w-full h-full flex flex-row-reverse">
                                        <div className="flex gap-2">
                                            <button onClick={searchVideo} className="h-full w-24 bg-[#A57EFD] rounded hover:bg-[#B88BFD]">
                                                <i className="bi bi-search-heart text-xl text-[#191919]"></i>
                                            </button>
                                            <button onClick={startDownload} className="h-full w-24 bg-[#A57EFD] rounded hover:bg-[#B88BFD]">
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