"use client";
import { useState } from "react";
import SummaryCards from "@/components/SummaryCards";
import PeopleAlsoAsk from "@/components/PeopleAlsoAsk";
import AIPrompts from "@/components/AIPrompts";
import OrganicSearches from "@/components/OrganicSearches";
import SocialMedia from "@/components/SocialMedia";

interface SearchResults {
  query: string;
  summary: {
    searchVolume: number;
    cpc: number;
    volumeLevel: string;
    cpcLevel: string;
  };
  peopleAlsoAsk: any;
  aiPrompts: any[];
  organicSearches: any[];
  socialMedia: {
    youtube: any[];
    tiktok: any[];
    instagram: any[];
  };
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-pulse">
      {/* Summary skeleton */}
      <div className="bg-[#fef6f3] rounded-2xl p-6 mb-8">
        <div className="h-7 w-40 bg-orange-200/50 rounded mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-8 w-20 bg-gray-100 rounded" />
          </div>
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-8 w-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
      {/* Tree skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <div className="h-7 w-60 bg-gray-100 rounded mb-4" />
        <div className="h-[300px] bg-gray-50 rounded-xl" />
      </div>
      {/* Table skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="h-7 w-48 bg-gray-100 rounded mb-6" />
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="flex gap-4 mb-4">
              <div className="h-5 flex-1 bg-gray-50 rounded" />
              <div className="h-5 w-24 bg-gray-50 rounded" />
              <div className="h-5 w-16 bg-gray-50 rounded" />
              <div className="h-5 w-16 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function exportToCSV(results: SearchResults) {
  const rows: string[][] = [["Section", "Keyword", "Volume", "CPC", "Info"]];

  // Summary
  rows.push(["Summary", results.query, String(results.summary.searchVolume), String(results.summary.cpc), `Volume: ${results.summary.volumeLevel}, CPC: ${results.summary.cpcLevel}`]);

  // AI Prompts
  for (const p of results.aiPrompts) {
    rows.push(["AI Prompt", p.prompt, "", "", `Intent: ${p.intent}, Sentiment: ${p.sentiment}`]);
  }

  // Organic
  for (const o of results.organicSearches) {
    rows.push(["Organic", o.keyword, String(o.volume), String(o.cpc), o.modifier || ""]);
  }

  // Social
  for (const platform of ["youtube", "tiktok", "instagram"] as const) {
    for (const s of results.socialMedia[platform]) {
      rows.push([`Social (${platform})`, s.keyword, String(s.volume), String(s.cpc), ""]);
    }
  }

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bto-explorer-${results.query}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
      }
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero / Search */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50/30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              BTO <span className="text-orange-500">Explorer</span>
            </h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Discover what people ask about{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Singapore BTO
            </span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Free keyword research for Singapore housing. Get AI-powered insights on search trends,
            questions, and social media buzz.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a keyword (e.g. bto, hdb renovation, ec condo)"
                className="search-input pl-12"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "Search"
              )}
            </button>
          </form>

          {/* Example searches */}
          {!results && !loading && (
            <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Try:</span>
              {["bto", "hdb renovation", "ec condo", "resale flat"].map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuery(ex);
                    setTimeout(() => {
                      const form = document.querySelector("form");
                      form?.requestSubmit();
                    }, 100);
                  }}
                  className="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm text-center">
            {error}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Results */}
      {results && (
        <div className="max-w-6xl mx-auto px-6 pb-16">
          {/* Summary */}
          <SummaryCards
            data={results.summary}
            keyword={results.query}
            onExport={() => exportToCSV(results)}
          />

          {/* People Also Ask */}
          {results.peopleAlsoAsk?.children?.length > 0 && (
            <PeopleAlsoAsk data={results.peopleAlsoAsk} keyword={results.query} />
          )}

          {/* AI Prompts */}
          {results.aiPrompts?.length > 0 && (
            <AIPrompts data={results.aiPrompts} keyword={results.query} />
          )}

          {/* Organic Searches */}
          {results.organicSearches?.length > 0 && (
            <OrganicSearches data={results.organicSearches} keyword={results.query} />
          )}

          {/* Social Media */}
          {(results.socialMedia?.youtube?.length > 0 ||
            results.socialMedia?.tiktok?.length > 0 ||
            results.socialMedia?.instagram?.length > 0) && (
              <SocialMedia data={results.socialMedia} keyword={results.query} />
            )}

          {/* Footer note */}
          <div className="text-center mt-8 text-xs text-gray-400">
            Data powered by Google Autocomplete &amp; Gemini AI estimates.
            Metrics are approximate and for research purposes only.
          </div>
        </div>
      )}
    </main>
  );
}
