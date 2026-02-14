"use client";
import { useState } from "react";

interface OrganicSearch {
    keyword: string;
    volume: number;
    cpc: number;
    modifier?: string;
}

function formatVolume(vol: number): string {
    if (vol >= 1000) return (vol / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return vol.toString();
}

type SortKey = "volume" | "cpc";
type SortDir = "asc" | "desc";

export default function OrganicSearches({
    data,
    keyword,
}: {
    data: OrganicSearch[];
    keyword: string;
}) {
    const [sortKey, setSortKey] = useState<SortKey>("volume");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const sorted = [...data].sort((a, b) => {
        const mult = sortDir === "asc" ? 1 : -1;
        return (a[sortKey] - b[sortKey]) * mult;
    });

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => (
        <span className={`ml-1 inline-flex flex-col text-[8px] leading-none ${active ? "text-orange-500" : "text-gray-300"}`}>
            <span className={dir === "asc" && active ? "text-orange-500" : ""}>▲</span>
            <span className={dir === "desc" && active ? "text-orange-500" : ""}>▼</span>
        </span>
    );

    return (
        <div className="results-section">
            {/* Header */}
            <div className="results-section-header">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">Organic Searches</h2>
                    <span className="text-sm text-gray-400">for {keyword}</span>
                    <div className="flex items-center gap-1.5 ml-1">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <div className="w-5 h-5 rounded-full bg-[#008373] flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold">b</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="w-[35%]">Keywords ⓘ</th>
                            <th className="w-[15%]">Composeo ⓘ</th>
                            <th className="w-[18%]">Modifiers ⓘ</th>
                            <th
                                className="w-[16%] cursor-pointer select-none"
                                onClick={() => toggleSort("volume")}
                            >
                                Volume ⓘ <SortIcon active={sortKey === "volume"} dir={sortDir} />
                            </th>
                            <th
                                className="w-[16%] cursor-pointer select-none"
                                onClick={() => toggleSort("cpc")}
                            >
                                CPC ⓘ <SortIcon active={sortKey === "cpc"} dir={sortDir} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span className="text-xs text-orange-500 font-bold">+</span>
                                        <span className="text-sm text-gray-700">{item.keyword}</span>
                                    </div>
                                </td>
                                <td>
                                    <button className="btn-generate">
                                        <span className="text-purple-500">✦</span> Generate Content
                                    </button>
                                </td>
                                <td>
                                    {item.modifier && (
                                        <span className="modifier-tag">{item.modifier}</span>
                                    )}
                                </td>
                                <td className="font-medium text-gray-900">
                                    {formatVolume(item.volume)}
                                </td>
                                <td>
                                    <div className="flex items-center gap-1">
                                        <span className="text-green-600 font-medium text-xs">$</span>
                                        <span className="text-gray-700">
                                            {item.cpc > 0 ? item.cpc.toFixed(2) : "-"}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
