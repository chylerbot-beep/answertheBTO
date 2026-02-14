"use client";
import { useState } from "react";

interface SocialKeyword {
    keyword: string;
    volume: number;
    cpc: number;
}

interface SocialMediaData {
    youtube: SocialKeyword[];
    tiktok: SocialKeyword[];
    instagram: SocialKeyword[];
}

type Platform = "youtube" | "tiktok" | "instagram";

function formatVolume(vol: number): string {
    if (vol >= 1000) return (vol / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return vol.toString();
}

const platformConfig: Record<
    Platform,
    { label: string; color: string; bg: string; icon: JSX.Element }
> = {
    youtube: {
        label: "Youtube",
        color: "text-red-600",
        bg: "bg-red-500",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19 31.66 31.66 0 000 12a31.66 31.66 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.66 31.66 0 0024 12a31.66 31.66 0 00-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
            </svg>
        ),
    },
    tiktok: {
        label: "Tiktok",
        color: "text-gray-900",
        bg: "bg-black",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.76 1.53V7.45a4.83 4.83 0 01-1-.76z" />
            </svg>
        ),
    },
    instagram: {
        label: "Instagram",
        color: "text-pink-600",
        bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
};

export default function SocialMedia({
    data,
    keyword,
}: {
    data: SocialMediaData;
    keyword: string;
}) {
    const [activeTab, setActiveTab] = useState<Platform>("youtube");

    const currentData = data[activeTab] || [];

    return (
        <div className="results-section">
            {/* Header */}
            <div className="results-section-header">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">Social Media</h2>
                    <span className="text-sm text-gray-400">for {keyword}</span>
                    <div className="flex items-center gap-1.5 ml-1">
                        {(["youtube", "tiktok", "instagram"] as Platform[]).map((p) => (
                            <div
                                key={p}
                                className={`w-6 h-6 rounded-full ${platformConfig[p].bg} flex items-center justify-center text-white`}
                            >
                                <span className="text-[10px]">
                                    {p === "youtube" ? "▶" : p === "tiktok" ? "♪" : "📷"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4">
                <div className="tab-bar">
                    {(["youtube", "tiktok", "instagram"] as Platform[]).map((platform) => (
                        <button
                            key={platform}
                            onClick={() => setActiveTab(platform)}
                            className={`tab-item ${activeTab === platform ? "active" : ""}`}
                        >
                            <span className={platformConfig[platform].color}>
                                {platformConfig[platform].icon}
                            </span>
                            {platformConfig[platform].label}
                        </button>
                    ))}
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
                            <th className="w-[16%]">Volume ⓘ</th>
                            <th className="w-[16%]">CPC ⓘ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <span className={`flex-shrink-0 ${platformConfig[activeTab].color}`}>
                                            {platformConfig[activeTab].icon}
                                        </span>
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
                                    <span className="modifier-tag">
                                        alphabeticals / {item.keyword.replace(keyword, "").trim().charAt(0) || "a"}
                                    </span>
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
