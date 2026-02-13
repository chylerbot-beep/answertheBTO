import React from 'react';

export default function ResultTables({ tableData }: { tableData: any[] }) {
  if (!tableData) return null;

  return (
    <div className="w-full max-w-6xl mt-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      <div className="bg-gray-900 p-6">
        <h2 className="text-white text-xl font-bold">Singapore SEO Campaign Planner</h2>
        <p className="text-gray-400 text-sm">Targeting: Google.com.sg (English)</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Keyword</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Est. Monthly Volume (SG)</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">SEO Difficulty</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Strategy Tip</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i} className="border-b hover:bg-blue-50/50 transition">
                <td className="p-4 font-semibold text-gray-800">{row.keyword}</td>
                <td className="p-4">
                  <span className="text-blue-600 font-mono font-bold">
                    {row.vol.toLocaleString()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${row.diff > 7 ? 'bg-red-500' : row.diff > 4 ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${row.diff * 10}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold">{row.diff}/10</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600 italic">"{row.tip}"</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
