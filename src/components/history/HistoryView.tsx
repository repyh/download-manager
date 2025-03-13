import { useMemo } from 'react';
import HistoryItem from './HistoryItem';

interface HistoryViewProps {
    completedDownloads: Array<any>;
    formatFileSize: (bytes: number) => string;
    formatDate: (dateString: string) => string;
    clearDownloadHistory: () => void;
    setActiveView: (view: string) => void;
    setDownloadURLWindow: (show: boolean) => void;
    removeHistoryItem: (id: string) => void;
}

const HistoryView = ({ 
    completedDownloads, 
    formatFileSize, 
    formatDate, 
    clearDownloadHistory,
    setActiveView,
    setDownloadURLWindow,
    removeHistoryItem
}: HistoryViewProps) => {
    
    // Calculate total storage used once
    const totalStorageUsed = useMemo(() => {
        return formatFileSize(completedDownloads.reduce((acc, dl) => acc + (dl.fileSize || 0), 0));
    }, [completedDownloads, formatFileSize]);

    // Create history list items
    const historyList = useMemo(() => {
        return completedDownloads.map((download, index) => (
            <HistoryItem
                key={download.id}
                download={download}
                index={index}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
                onDeleteItem={removeHistoryItem}
            />
        ));
    }, [completedDownloads, formatFileSize, formatDate, removeHistoryItem]);

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-gray-800 font-medium nunito">Total Downloads</h3>
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1e40af] flex items-center justify-center">
                            <i className="bi bi-download"></i>
                        </div>
                    </div>
                    <p className="text-3xl text-gray-800 font-bold nunito">{completedDownloads.length}</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-gray-800 font-medium nunito">Storage Used</h3>
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <i className="bi bi-hdd"></i>
                        </div>
                    </div>
                    <p className="text-3xl text-gray-800 font-bold nunito">{totalStorageUsed}</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-gray-800 font-medium nunito">Last Download</h3>
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                            <i className="bi bi-clock-history"></i>
                        </div>
                    </div>
                    <p className="text-lg text-gray-800 font-medium inter">
                        {completedDownloads.length > 0
                            ? formatDate(completedDownloads[0].completedAt)
                            : 'No downloads yet'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex-1">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-gray-800 text-lg font-bold nunito">Download History</h2>
                        <p className="text-gray-500 text-sm inter">Browse your completed downloads</p>
                    </div>
                    {completedDownloads.length > 0 && (
                        <button
                            onClick={clearDownloadHistory}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm nunito font-medium"
                        >
                            Clear History
                        </button>
                    )}
                </div>

                {completedDownloads.length > 0 ? (
                    <div className="overflow-auto max-h-[calc(100vh-320px)]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase inter font-medium">
                                <tr>
                                    <th className="px-6 py-3">File Name</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Size</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyList}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <i className="bi bi-clock-history text-3xl text-[#1e40af]"></i>
                        </div>
                        <h3 className="text-gray-800 font-medium text-lg mb-2 nunito">No download history</h3>
                        <p className="text-gray-500 text-sm mb-6 inter">Completed downloads will appear here</p>
                        <button
                            onClick={() => {
                                setActiveView('downloads');
                                setDownloadURLWindow(true);
                            }}
                            className="px-4 py-2 bg-[#1e40af] text-white rounded-lg hover:bg-[#1e3a8a] transition-colors nunito font-medium"
                        >
                            Start a new download
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryView;
