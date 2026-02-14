"use client";

interface SummaryData {
    searchVolume: number;
    cpc: number;
    volumeLevel: string;
    cpcLevel: string;
}

function formatVolume(vol: number): string {
    if (vol >= 1000) return (vol / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return vol.toString();
}

function getBadgeClass(level: string): string {
    switch (level.toLowerCase()) {
        case "high": return "badge badge-high";
        case "medium": return "badge badge-medium";
        case "low": return "badge badge-low";
        default: return "badge badge-medium";
    }
}

export default function SummaryCards({
    data,
    keyword,
    onExport,
}: {
    data: SummaryData;
    keyword: string;
    onExport?: () => void;
}) {
    return (
        <div className="bg-[#fef6f3] rounded-2xl p-6 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">Summary</h2>
                    <span className="text-sm text-gray-400">for {keyword}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onExport} className="btn-export">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search Volume Card */}
                <div className="metric-card flex flex-col items-center text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <svg className="w-7 h-7" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Search Volume ⓘ</p>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-gray-900">
                            {formatVolume(data.searchVolume)}
                        </span>
                        <span className={getBadgeClass(data.volumeLevel)}>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.97 5.97 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.97 5.97 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            {data.volumeLevel}
                        </span>
                    </div>
                </div>

                {/* CPC Card */}
                <div className="metric-card flex flex-col items-center text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <svg className="w-7 h-7" viewBox="0 0 24 24">
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="#4285F4" />
                            <path d="M12 2L4.5 20.29l.71.71L12 18V2z" fill="#34A853" />
                            <path d="M12 18l6.79 3 .71-.71L12 2v16z" fill="#EA4335" />
                            <path d="M12 18l-6.79 3-.71-.71L12 2v16z" fill="#FBBC05" />
                        </svg>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Cost Per Click ⓘ</p>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-gray-900">
                            US$ {data.cpc.toFixed(2)}
                        </span>
                        <span className={getBadgeClass(data.cpcLevel)}>
                            <span className="text-green-600 font-bold">$</span>
                            {data.cpcLevel}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
