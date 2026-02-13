import React from 'react';

const ResultRow = ({ icon, text, type, badgeColor }: any) => (
  <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
    <div className="flex items-center gap-3">
      <span className="w-6 text-center">{icon}</span>
      <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] md:max-w-md">{text}</span>
    </div>
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded text-white ${badgeColor}`}>
      {type}
    </span>
  </div>
);

export default function ResultTables({ organic, youtube, aiPrompts }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mt-12 pb-20">
      
      {/* 1. AI LANE (Gemini) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-700">
          ✨ AI Content Prompts
        </h3>
        {aiPrompts.map((item: any, i: number) => (
          <ResultRow key={i} icon="🪄" text={item.text} type="GEMINI" badgeColor="bg-purple-500" />
        ))}
      </div>

      {/* 2. ORGANIC LANE (Google) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-700">
          🔍 Google Search Results
        </h3>
        {organic.slice(0, 6).map((text: string, i: number) => (
          <ResultRow key={i} icon="G" text={text} type="SEARCH" badgeColor="bg-blue-500" />
        ))}
      </div>

      {/* 3. SOCIAL MEDIA (YouTube) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 md:col-span-2">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-700">
          🎥 Video & Social Search (YouTube)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {youtube.map((text: string, i: number) => (
            <ResultRow key={i} icon="▶" text={text} type="YOUTUBE" badgeColor="bg-red-500" />
          ))}
        </div>
      </div>

    </div>
  );
}
