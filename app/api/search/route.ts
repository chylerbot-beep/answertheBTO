import { NextResponse } from "next/server";

// ─── Google Autocomplete (free, no key) ────────────────────────────────────
async function fetchAutocompleteSuggestions(keyword: string): Promise<string[]> {
  const modifiers = [
    // Post-modifiers (keyword + m)
    "", "price", "review", "vs", "best", "near", "singapore", "hdb", "application",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    // Pre-modifiers (m + keyword) will be handled by logic below
    "how to", "what is", "when", "where", "can i"
  ];

  const allResults: string[] = [];
  const batches = [];

  // 1. Standard "Keyword + Modifier"
  for (const m of modifiers) {
    const query = m.includes(" ") ? `${m} ${keyword}` : `${keyword} ${m}`; // Simple heuristic
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&gl=sg&hl=en-GB&q=${encodeURIComponent(query.trim())}`;

    batches.push(
      fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      })
        .then((r) => r.json())
        .then((d) => (d[1] as string[]) || [])
        .catch(() => [] as string[])
    );
  }

  // 2. Specific "Question + Keyword" loop for better PAA foundation
  const questionStarters = ["how to", "what is", "why", "when is", "where to", "can", "is"];
  for (const q of questionStarters) {
    batches.push(
      fetch(`https://suggestqueries.google.com/complete/search?client=firefox&gl=sg&hl=en-GB&q=${encodeURIComponent(`${q} ${keyword}`)}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      })
        .then((r) => r.json())
        .then((d) => (d[1] as string[]) || [])
        .catch(() => [] as string[])
    );
  }

  const results = await Promise.all(batches);
  for (const r of results) allResults.push(...r);

  return Array.from(new Set(allResults));
}

// ─── Categorize keywords into question vs organic ──────────────────────────
function categorizeKeywords(keywords: string[]) {
  const questionStarters = ["what", "how", "why", "when", "where", "which", "who", "can", "is", "do", "does", "will", "should", "are"];
  const questions: string[] = [];
  const organic: string[] = [];

  for (const kw of keywords) {
    const lower = kw.toLowerCase().trim();
    if (questionStarters.some((q) => lower.startsWith(q + " ")) || lower.includes("?")) {
      questions.push(kw);
    } else {
      organic.push(kw);
    }
  }
  return { questions, organic };
}

// ─── Fallback PAA Builder (if Gemini fails) ──────────────────────────────
function buildFallbackTree(keyword: string, questions: string[]) {
  const groups: Record<string, string[]> = {};
  for (const q of questions) {
    const words = q.split(" ");
    const key = words.slice(0, Math.min(4, Math.ceil(words.length / 2))).join(" ");
    if (!groups[key]) groups[key] = [];
    groups[key].push(q);
  }

  const children = Object.entries(groups)
    .slice(0, 8)
    .map(([branch, qs]) => ({
      name: branch,
      children: qs.slice(0, 6).map((q) => ({ name: q })),
    }));

  return { name: keyword, children };
}

// ─── Gemini AI for enrichment & PAA Generation ─────────────────────────────
async function enrichWithGemini(keyword: string, organicKeywords: string[], questions: string[]) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Return fallback if no key
    return {
      summary: { searchVolume: 0, cpc: 0, volumeLevel: "N/A", cpcLevel: "N/A" },
      peopleAlsoAsk: buildFallbackTree(keyword, questions),
      aiPrompts: [], organicSearches: [], socialMedia: { youtube: [], tiktok: [], instagram: [] }
    };
  }

  const prompt = `
    Context: Singapore Housing / BTO / Real Estate.
    Role: Senior SEO Strategist.
    Task: deeply analyze the keyword "${keyword}" and provided data to generate a rich JSON report.

    Input Data:
    - Detected Questions: ${questions.slice(0, 10).join(", ")}
    - detected Keywords: ${organicKeywords.slice(0, 10).join(", ")}

    Requirements:
    1. **peopleAlsoAsk**: Generate a MASSIVE, deeply nested tree of questions specifically about "${keyword}" in Singapore.
       - Structure: Root -> 4-6 Main Categories -> 5-8 Specific Questions per category.
       - Questions must be highly relevant to Singapore (mention HDB, BTO, CPF, grants, etc. where applicable).
       - Total questions should be 20-30+.
    
    2. **summary**: Estimate monthly search volume and CPC in Singapore (SGD/USD).
    
    3. **aiPrompts**: Generate 8 unique, high-intent prompts users might ask an AI about this topic.
    
    4. **organicSearches** & **socialMedia**: Enrich the provided list or generate new Singapore-trend-relevant keywords.

    Return ONLY valid JSON:
    {
      "summary": {
        "searchVolume": <number>,
        "cpc": <number>,
        "volumeLevel": "<High|Medium|Low>",
        "cpcLevel": "<High|Medium|Low>"
      },
      "peopleAlsoAsk": {
        "name": "${keyword}",
        "children": [
          {
            "name": "<Category, e.g. Eligibility>",
            "children": [
              { "name": "<Specific Question 1>" },
              { "name": "<Specific Question 2>" }
            ]
          }
           ... (at least 4 categories)
        ]
      },
      "aiPrompts": [ ... ],
      "organicSearches": [ ... ],
      "socialMedia": { "youtube": [...], "tiktok": [...], "instagram": [...] }
    }
  `;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Gemini Error:", e);
  }

  return null; // Signals to use fallback
}

// ─── Main Handler ──────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });

  try {
    // 1. Fetch real autocomplete data (foundation)
    const allKeywords = await fetchAutocompleteSuggestions(query);
    const { questions, organic } = categorizeKeywords(allKeywords);

    // 2. Try Gemini Enrichment (Primary)
    let enriched = await enrichWithGemini(query, organic, questions);

    // 3. Fallback if Gemini fails
    if (!enriched) {
      enriched = {
        summary: { searchVolume: 1000, cpc: 1.0, volumeLevel: "Medium", cpcLevel: "Low" },
        peopleAlsoAsk: buildFallbackTree(query, questions),
        aiPrompts: [],
        organicSearches: organic.map(k => ({ keyword: k, volume: 0, cpc: 0 })),
        socialMedia: { youtube: [], tiktok: [], instagram: [] }
      };
    }

    // 4. Merge/Ensure structure
    return NextResponse.json({
      query,
      summary: enriched.summary,
      peopleAlsoAsk: enriched.peopleAlsoAsk, // Now sourced from Gemini for depth
      aiPrompts: enriched.aiPrompts,
      organicSearches: enriched.organicSearches,
      socialMedia: enriched.socialMedia
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
