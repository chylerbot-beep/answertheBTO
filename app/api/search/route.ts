import { NextResponse } from "next/server";

async function fetchSuggestions(keyword: string) {
  // SEO Modifiers: Alphabet soup + Question starters
  const modifiers = ["", "how", "price", "review", "contractor", "a", "b", "c", "d"];
  let results: string[] = [];

  for (const m of modifiers) {
    const query = m ? `${keyword} ${m}` : keyword;
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&gl=sg&hl=en-GB&q=${encodeURIComponent(query)}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const data = await res.json();
      if (data[1]) results.push(...data[1]);
    } catch (e) { continue; }
  }
  return Array.from(new Set(results));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  const allKeywords = await fetchSuggestions(query);
  const topKeywords = allKeywords.slice(0, 40); // Select top 40 for scoring

  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `
    Act as a Singapore SEO Strategist. Analyze these keywords for "${query}":
    ${topKeywords.join(", ")}

    For each keyword, estimate:
    1. SearchVolume: A relative number between 500 and 50000 based on Singapore HDB/Property trends.
    2. Difficulty: 1-10 (How hard to rank on Google SG).
    3. Opportunity: A short SEO tip.

    Organize the keywords into a Mind Map with 4 branches: "High Volume", "Low Hanging Fruit", "Financial/Grants", and "Comparison".

    Return ONLY JSON:
    {
      "tableData": [ {"keyword": "...", "vol": 1200, "diff": 3, "tip": "..."} ],
      "wheelData": { "name": "${query}", "children": [...] }
    }
  `;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const gData = await geminiRes.json();
    const text = gData.candidates[0].content.parts[0].text;

    // This regex is the "Safety Net" for AI-generated JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!cleaned) throw new Error("Could not parse AI response");

    return NextResponse.json({
      tableData: cleaned.tableData || [],
      wheelData: cleaned.wheelData || { name: query, children: [] }
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch SEO metrics" });
  }
}
