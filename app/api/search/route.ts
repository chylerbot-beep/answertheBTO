import { NextResponse } from "next/server";

async function fetchSuggestions(source: "web" | "youtube", keyword: string) {
  const ds = source === "youtube" ? "&ds=yt" : "";
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&gl=sg${ds}&q=${encodeURIComponent(keyword)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    return data[1] || [];
  } catch (e) { return []; }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  // 1. Fetch RAW Data (The Sources)
  const [organic, youtube] = await Promise.all([
    fetchSuggestions("web", query),
    fetchSuggestions("youtube", query),
  ]);

  // 2. Build the Wheel Structure (PURELY Google Autocomplete)
  // We group the organic results by their first word to create "branches"
  const branches: Record<string, any> = {};
  organic.forEach((s: string) => {
    const firstWord = s.split(" ")[0].toLowerCase();
    if (!branches[firstWord]) branches[firstWord] = [];
    branches[firstWord].push({ name: s });
  });

  const wheelData = {
    name: query.toUpperCase(),
    children: Object.keys(branches).map(key => ({
      name: key.toUpperCase(),
      children: branches[key]
    }))
  };

  // 3. Gemini ONLY generates AI Prompts (Separate lane)
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `Based on the keyword "${query}", generate 6 unique AI prompts a user would ask a chatbot. Return ONLY JSON: {"prompts": [{"text": "...", "intent": "I"}]}`;

  let aiPrompts = [];
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
    const cleaned = JSON.parse(text.replace(/```json|```/g, ""));
    aiPrompts = cleaned.prompts;
  } catch (e) {
    aiPrompts = [{ text: `How to start with ${query}?`, intent: "I" }];
  }

  return NextResponse.json({
    wheelData,    // For the middle chart (Google only)
    aiPrompts,    // For the AI section (Gemini only)
    youtube,      // For Social section (YouTube only)
    organic       // For Organic table
  });
}
