import { NextResponse } from "next/server";

// ─── Google Autocomplete (free, no key) ────────────────────────────────────
async function fetchAutocompleteSuggestions(keyword: string): Promise<string[]> {
  const modifiers = [
    "", "what", "how", "why", "when", "where", "which", "who", "can", "is",
    "price", "review", "vs", "best", "near",
    "a", "b", "c", "d", "e", "f", "g", "h"
  ];
  const allResults: string[] = [];

  const batches = [];
  for (const m of modifiers) {
    const query = m ? `${keyword} ${m}` : keyword;
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&gl=sg&hl=en-GB&q=${encodeURIComponent(query)}`;
    batches.push(
      fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
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
  const questionStarters = ["what", "how", "why", "when", "where", "which", "who", "can", "is", "do", "does", "will", "should"];
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

// ─── Build People Also Ask tree from questions ─────────────────────────────
function buildQuestionTree(keyword: string, questions: string[]) {
  // Group questions by their starter word
  const groups: Record<string, string[]> = {};
  for (const q of questions) {
    const words = q.toLowerCase().split(" ");
    // Create branch names like "What is a BTO?" from first few words
    const branchKey = words.slice(0, Math.min(5, words.length)).join(" ");
    if (!groups[branchKey]) groups[branchKey] = [];
    groups[branchKey].push(q);
  }

  // If too many branches, re-group by first 3-4 words
  const starterGroups: Record<string, string[]> = {};
  for (const q of questions) {
    const words = q.split(" ");
    const key = words.slice(0, Math.min(4, Math.ceil(words.length / 2))).join(" ");
    if (!starterGroups[key]) starterGroups[key] = [];
    starterGroups[key].push(q);
  }

  // Build hierarchy: keyword → grouped questions → individual questions
  const children = Object.entries(starterGroups)
    .slice(0, 8) // max 8 branches
    .map(([branch, qs]) => ({
      name: branch.length > 40 ? branch.slice(0, 40) + "…" : branch,
      children: qs.slice(0, 8).map((q) => ({ name: q })),
    }));

  return { name: keyword, children };
}

// ─── Gemini AI for enrichment ──────────────────────────────────────────────
async function enrichWithGemini(keyword: string, organicKeywords: string[], questions: string[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackData(keyword, organicKeywords, questions);
  }

  const prompt = `You are an SEO analyst specializing in Singapore property/housing. Analyze the keyword "${keyword}" and the following related keywords.

Organic keywords: ${organicKeywords.slice(0, 25).join(", ")}
Question keywords: ${questions.slice(0, 15).join(", ")}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "summary": {
    "searchVolume": <number, estimated monthly search volume in Singapore, between 100-50000>,
    "cpc": <number, estimated CPC in USD, between 0.10-5.00>,
    "volumeLevel": "<High|Medium|Low>",
    "cpcLevel": "<High|Medium|Low>"
  },
  "aiPrompts": [
    {
      "prompt": "<a natural question users might ask, phrased as a full sentence>",
      "intent": "<informational|transactional|navigational|commercial>",
      "sentiment": "<positive|negative|neutral>",
      "brands": ["<relevant brand/org names, e.g. HDB, Tampines Bliss, etc>"]
    }
  ],
  "organicSearches": [
    {
      "keyword": "<the keyword>",
      "volume": <estimated monthly volume>,
      "cpc": <estimated CPC in USD>,
      "modifier": "<alphabeticals / first_letter>"
    }
  ],
  "socialMedia": {
    "youtube": [{"keyword": "<keyword>", "volume": <number>, "cpc": <number>}],
    "tiktok": [{"keyword": "<keyword>", "volume": <number>, "cpc": <number>}],
    "instagram": [{"keyword": "<keyword>", "volume": <number>, "cpc": <number>}]
  }
}

Generate 6-8 aiPrompts, enrich all provided organic keywords with estimated metrics, and generate 5-8 social media keywords per platform. Make the estimates realistic for Singapore market.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response (handle markdown code fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Gemini error:", e);
  }

  return generateFallbackData(keyword, organicKeywords, questions);
}

// ─── Fallback data when Gemini is unavailable ──────────────────────────────
function generateFallbackData(keyword: string, organicKeywords: string[], questions: string[]) {
  return {
    summary: {
      searchVolume: Math.floor(Math.random() * 15000) + 1000,
      cpc: +(Math.random() * 2 + 0.1).toFixed(2),
      volumeLevel: "Medium",
      cpcLevel: "Low",
    },
    aiPrompts: questions.slice(0, 8).map((q) => ({
      prompt: q,
      intent: "informational",
      sentiment: "neutral",
      brands: [],
    })),
    organicSearches: organicKeywords.slice(0, 20).map((kw) => ({
      keyword: kw,
      volume: Math.floor(Math.random() * 5000) + 100,
      cpc: +(Math.random() * 2 + 0.1).toFixed(2),
      modifier: `alphabeticals / ${kw.replace(keyword, "").trim().charAt(0) || "a"}`,
    })),
    socialMedia: {
      youtube: organicKeywords.slice(0, 6).map((kw) => ({
        keyword: kw,
        volume: Math.floor(Math.random() * 5000) + 50,
        cpc: +(Math.random() * 3 + 0.2).toFixed(2),
      })),
      tiktok: organicKeywords.slice(3, 9).map((kw) => ({
        keyword: kw,
        volume: Math.floor(Math.random() * 3000) + 50,
        cpc: +(Math.random() * 2 + 0.1).toFixed(2),
      })),
      instagram: organicKeywords.slice(5, 11).map((kw) => ({
        keyword: kw,
        volume: Math.floor(Math.random() * 2000) + 30,
        cpc: +(Math.random() * 4 + 0.3).toFixed(2),
      })),
    },
  };
}

// ─── Main handler ──────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  try {
    // 1. Fetch autocomplete suggestions
    const allKeywords = await fetchAutocompleteSuggestions(query);

    // 2. Categorize
    const { questions, organic } = categorizeKeywords(allKeywords);

    // 3. Build People Also Ask tree
    const peopleAlsoAsk = buildQuestionTree(query, questions);

    // 4. Enrich with Gemini AI
    const enriched = await enrichWithGemini(query, organic, questions);

    return NextResponse.json({
      query,
      summary: enriched.summary,
      peopleAlsoAsk,
      aiPrompts: enriched.aiPrompts || [],
      organicSearches: enriched.organicSearches || [],
      socialMedia: enriched.socialMedia || { youtube: [], tiktok: [], instagram: [] },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to process search" }, { status: 500 });
  }
}
