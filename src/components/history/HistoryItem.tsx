import { memo, useState, useRef, useEffect } from 'react';

// Define interface for HistoryItem props
export interface HistoryItemProps {
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
    onDeleteItem: (id: string) => void;
}

// HistoryItem component - memoized to prevent unnecessary re-renders
const HistoryItem = memo(({ download, index, formatFileSize, formatDate, onDeleteItem }: HistoryItemProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Function to handle opening file location
    const openFileLocation = () => {
        try {
            // Looking at the log, the download.id seems to be in format "fileName/fileType_timestamp"
            // We need to reconstruct the actual file path
            const downloadPath = localStorage.getItem('download-default-location');
            
            // Use the fileName and fileType from the download object directly
            const filePath = `${downloadPath}/${download.fileName}.${download.fileType}`;
            
            // Use electron to open folder containing the file
            window.electron.ipcRenderer.sendMessage('open-file-location', [filePath]);
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Failed to open file location:', error);
        }
    };
    
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
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
                {/* Changed from "relative" to prevent container issues */}
                <div ref={menuRef} className="inline-block text-left">
                    <button 
                        className="text-gray-500 hover:text-[#1e40af] transition-colors p-1 rounded-full hover:bg-blue-50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        title="Options"
                    >
                        <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    
                    {/* Dropdown menu - improved positioning and styling */}
                    {isMenuOpen && (
                        <div className="fixed transform -translate-x-[80%] mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 border border-gray-200">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1e40af] w-full text-left transition-colors"
                                    role="menuitem"
                                    onClick={openFileLocation}
                                >
                                    <i className="bi bi-folder2-open"></i>
                                    Open folder location
                                </button>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 w-full text-left transition-colors"
                                    role="menuitem"
                                    onClick={() => {
                                        onDeleteItem(download.id);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <i className="bi bi-trash"></i>
                                    Delete from history
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
});

export default HistoryItem;
