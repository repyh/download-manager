export default function Main() {
    const { electron } = window;

    function closeApp() {
        electron.ipcRenderer.sendMessage('close-app', []);
    }

    function minimizeApp() {
        electron.ipcRenderer.sendMessage('minimize-app', []);
    }

    return (
        <div className="h-screen w-screen bg-[#16171D]">
            <div className="w-full h-16 flex justify-end items-center draggable">
                <div className="w-auto h-full flex-grow flex items-center">
                    <div className="h-full w-24 group flex justify-center items-center no-drag">
                        <button className="h-[65%] w-[65%] group-hover:bg-[#1e1f27] flex justify-center items-center rounded-lg">
                            <i className="bi bi-plus-lg text-xl text-[#A57EFD]"></i>
                        </button>
                        <div className="absolute top-0 left-0 transform origin-top-left scale-0 w-52 h-80 ml-8 mt-10 group-hover:scale-100 transition duration-150">
                            <div className="absolute top-0 left-0 mt-10 w-52 h-80 bg-[#1e1f27] rounded-xl rounded-tl-none flex justify-center items-center">
                                <div className="absolute top-0 left-0 -mt-4 w-0 h-0 border-t-[16px] border-t-transparent border-l-[14px] border-l-[#1e1f27]"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-full px-5 flex">
                    <div className="h-8 pt-6">
                        <div className="h-full flex justify-center items-center gap-3">
                            <button className="w-3 h-3 bg-green-500 hover:bg-green-400 rounded-full"></button>
                            <button className="w-3 h-3 bg-yellow-500 hover:bg-yellow-400 rounded-full"></button>
                            <button onClick={closeApp} className="w-3 h-3 bg-red-500 hover:bg-red-400 rounded-full"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}