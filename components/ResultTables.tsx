import React from 'react';

// Reusable Table Row
const ResultRow = ({ icon, text, type, badgeColor }: any) => (
  <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition">
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-gray-700">{text}</span>
    </div>
    <div className="flex items-center gap-2">
      {type && (
        <span className={`px-2 py-0.5 text-xs font-bold rounded text-white ${badgeColor}`}>
          {type}
        </span>
      )}
      <button className="text-xs border px-3 py-1 rounded hover:bg-gray-100 text-gray-600">
        ✨ Generate Content
      </button>
    </div>
  </div>
);

export default function ResultTables({ organic, youtube, aiPrompts }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mt-10">
      
      {/* AI Prompts Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🤖 AI Prompts <span className="text-sm font-normal text-gray-400">Gemini Powered</span>
        </h2>
        <div className="flex flex-col">
          {aiPrompts.map((item: any, i: number) => (
            <ResultRow 
              key={i} 
              icon="⚡" 
              text={item.prompt} 
              type={item.intent?.[0] || "I"} 
              badgeColor="bg-orange-500" 
            />
          ))}
        </div>
      </div>

      {/* Organic Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🌍 Organic Searches <span className="text-sm font-normal text-gray-400">Google</span>
        </h2>
        <div className="flex flex-col">
          {organic.map((text: string, i: number) => (
            <ResultRow 
              key={i} 
              icon="G" 
              text={text} 
              type="SEO" 
              badgeColor="bg-blue-500" 
            />
          ))}
        </div>
      </div>

       {/* Social Media Section */}
       <div className="bg-white p-6 rounded-xl shadow-md border md:col-span-2">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          ▶️ Social Media <span className="text-sm font-normal text-gray-400">YouTube</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {youtube.map((text: string, i: number) => (
             <div key={i} className="flex items-center justify-between p-3 border rounded hover:bg-red-50">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="text-red-500">▶</span> {text}
                </span>
             </div>
          ))}
        </div>
      </div>

    </div>
  );
}
