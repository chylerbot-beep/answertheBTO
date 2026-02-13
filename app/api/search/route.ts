import { NextResponse } from "next/server";

// Helper to fetch autocomplete suggestions
async function fetchSuggestions(source: "web" | "youtube", keyword: string) {
  const client = source === "youtube" ? "youtube" : "firefox";
  const url = `https://suggestqueries.google.com/complete/search?client=${client}&ds=${source === "youtube" ? "yt" : ""}&q=${keyword}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    // Google returns [query, [suggestions...]]
    return data[1] || [];
  } catch (e) {
    console.error(`Error fetching ${source}:`, e);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ error: "No query" });

  // 1. Parallel Data Fetching
  const [organicRaw, youtubeRaw] = await Promise.all([
    fetchSuggestions("web", query),
    fetchSuggestions("youtube", query),
  ]);

  // Limit results for the wheel/tables
  const organic = organicRaw.slice(0, 10);
  const youtube = youtubeRaw.slice(0, 10);

  // 2. Ask Gemini to generate "AI Prompts" and organize the Wheel
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `
    Context: Keyword "${query}" for Singapore audience (BTO/Housing).
    
    Task 1: Generate 6 creative "AI Prompts" that a user might ask an AI about this topic. 
    Format: Array of objects { "prompt": string, "intent": "Informational" | "Commercial" | "Navigational" }.
    
    Task 2: Organize these combined keywords into a tree structure for a visualization:
    Keywords: ${[...organic, ...youtube].join(", ")}
    
    Return ONLY JSON with this structure:
    {
      "aiPrompts": [ ... ],
      "wheelData": {
        "name": "${query}",
        "children": [
          { "name": "Search Engine", "children": [ ...use organic keywords here... ] },
          { "name": "Social Video", "children": [ ...use youtube keywords here... ] },
          { "name": "AI Intent", "children": [ ...use generated prompts here... ] }
        ]
      }
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

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    // Return the combined dashboard data
    return NextResponse.json({
      organic,
      youtube,
      aiPrompts: parsedData.aiPrompts || [],
      treeData: parsedData.wheelData || { name: query, children: [] }
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if Gemini fails
    return NextResponse.json({
      organic,
      youtube,
      aiPrompts: [],
      treeData: {
        name: query,
        children: [
          { name: "Google", children: organic.map((s: string) => ({ name: s })) },
          { name: "YouTube", children: youtube.map((s: string) => ({ name: s })) }
        ]
      }
    });
  }
}
