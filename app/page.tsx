"use client";
import { useState } from "react";
import BtoWheel from "@/components/BtoWheel";
import ResultTables from "@/components/ResultTables";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if(!query) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans text-gray-900">
      
      {/* Header */}
      <div className="text-center max-w-2xl mb-10">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800 tracking-tight">
          BTO <span className="text-orange-500">SEO Planner</span>
        </h1>
        <p className="text-gray-500 text-lg">
          Discover Singapore BTO keywords with AI-powered SEO metrics.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 w-full max-w-xl mb-12 shadow-lg p-2 bg-white rounded-full border">
        <input 
          className="flex-1 p-4 rounded-l-full outline-none text-lg ml-4"
          placeholder="Enter a topic (e.g. Tengah BTO, HFE, Reno)"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Search"}
        </button>
      </div>

      {/* Results Area */}
      {results && (
        <>
          {/* 1. Visualization */}
          <div className="w-full flex justify-center mb-12 fade-in">
             <BtoWheel data={results.wheelData} />
          </div>

          {/* 2. SEO Data Table */}
          <ResultTables tableData={results.tableData} />
        </>
      )}
    </main>
  );
}
