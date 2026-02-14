"use client";
import { useState } from "react";

interface AIPrompt {
    prompt: string;
    intent: string;
    sentiment: string;
    brands: string[];
}

function IntentDot({ intent }: { intent: string }) {
    const cls = `intent-dot intent-${intent}`;
    return (
        <div className="flex items-center gap-1.5">
            <div className={cls} />
        </div>
    );
}

function SentimentLabel({ sentiment }: { sentiment: string }) {
    const colors: Record<string, string> = {
        positive: "text-green-600",
        negative: "text-red-500",
        neutral: "text-gray-400",
    };
    return (
        <span className={`text-sm font-medium ${colors[sentiment] || colors.neutral}`}>
            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
        </span>
    );
}

export default function AIPrompts({
    data,
    keyword,
}: {
    data: AIPrompt[];
    keyword: string;
}) {
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    return (
        <div className="results-section">
            {/* Header */}
            <div className="results-section-header">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">AI Prompts</h2>
                    <span className="text-sm text-gray-400">for {keyword}</span>
                    {/* AI icons */}
                    <div className="flex items-center gap-1.5 ml-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">AI</span>
                        </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                        Beta
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="w-[45%]">Prompt ⓘ</th>
                            <th className="w-[15%]">Composeo ⓘ</th>
                            <th className="w-[10%]">Intent ⓘ</th>
                            <th className="w-[12%]">Sentiment ⓘ</th>
                            <th className="w-[18%]">Brands ⓘ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <tr key={idx} className="group">
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[10px] text-gray-400">⚙</span>
                                        </div>
                                        <span className="text-gray-700 text-sm leading-relaxed">{item.prompt}</span>
                                        <button
                                            onClick={() => handleCopy(item.prompt, idx)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                            title="Copy"
                                        >
                                            {copiedIdx === idx ? (
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <button className="btn-generate">
                                        <span className="text-purple-500">✦</span> Generate Content
                                    </button>
                                </td>
                                <td>
                                    <IntentDot intent={item.intent} />
                                </td>
                                <td>
                                    <SentimentLabel sentiment={item.sentiment} />
                                </td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {item.brands.slice(0, 2).map((brand, bIdx) => (
                                            <span key={bIdx} className="brand-tag text-[11px]">
                                                {brand}
                                            </span>
                                        ))}
                                        {item.brands.length > 2 && (
                                            <span className="text-xs text-gray-400 ml-1">
                                                +{item.brands.length - 2}
                                            </span>
                                        )}
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
