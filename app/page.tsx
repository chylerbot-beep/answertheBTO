"use client";
import { useState } from "react";
import BtoWheel from "@/components/BtoWheel";

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      
      if (json.error) {
        setError(json.error);
        setData(null);
      } else {
        // Wrap Gemini JSON into a "root" for D3
        setData({
          name: query.toUpperCase(),
          children: Object.keys(json).map(key => ({
            name: key,
            children: json[key]
          }))
        });
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          BTO Answer Finder
        </h1>
        <p className="text-gray-600 text-lg">
          Discover what Singaporeans are asking about BTO housing
        </p>
      </div>

      {/* Search Box */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full max-w-xl">
        <input
          className="flex-1 border-2 border-gray-200 p-3 rounded-lg text-gray-800 text-lg 
                     focus:border-red-500 focus:outline-none transition-colors
                     placeholder:text-gray-400"
          placeholder="Enter keyword (e.g. Tengah, HFE, Singles)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 
                     text-white px-8 py-3 rounded-lg font-semibold text-lg
                     transition-colors duration-200 whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Searching...
            </span>
          ) : "Search"}
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <span className="text-gray-500 text-sm">Try:</span>
        {["Tengah", "BTO 2024", "HFE", "Singles", "Resale"].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setQuery(suggestion);
            }}
            className="text-sm px-3 py-1 bg-white border border-gray-200 rounded-full
                       hover:border-red-300 hover:text-red-500 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Visualization */}
      {data && (
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 overflow-hidden">
          <BtoWheel data={data} />
        </div>
      )}

      {/* Legend */}
      {data && (
        <div className="flex gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Eligibility</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Financials</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-10 text-center text-gray-400 text-sm">
        Powered by Google Autocomplete & Gemini AI
      </footer>
    </main>
  );
}
