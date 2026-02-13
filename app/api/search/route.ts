import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ error: "No query" });

  // 1. Fetch Google Autocomplete
  const modifiers = ["why", "how", "when", "can", "bto"];
  let rawSuggestions: string[] = [];

  try {
    for (const m of modifiers) {
      const res = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&gl=sg&q=${m} ${query}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data[1]) {
          rawSuggestions.push(...data[1]);
        }
      }
    }
  } catch (err) {
    console.error("Autocomplete error:", err);
  }

  // Deduplicate
  const uniqueSuggestions = Array.from(new Set(rawSuggestions));
  const limitedSuggestions = uniqueSuggestions.slice(0, 30); // Limit to 30 to save tokens

  // 2. Use Gemini via Direct Fetch (Force v1 Stable Endpoint)
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `
    I have a list of search suggestions: ${limitedSuggestions.join(", ")}.
    Act as a Singapore HDB expert. Organize these into a JSON structure for a mind map.
    Create 3 main branches: "Questions", "Eligibility", and "Financials".
    Each branch should have an array of children objects with a "name" property.
    Only return valid JSON. Do not wrap in markdown.
  `;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const geminiJson = await geminiRes.json();
    
    // Safety check for Gemini response structure
    if (!geminiJson.candidates || !geminiJson.candidates[0].content) {
      throw new Error("Invalid Gemini response");
    }

    const responseText = geminiJson.candidates[0].content.parts[0].text;
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanedJson));

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if Gemini fails: just return the raw list structured simply
    return NextResponse.json({
      name: query.toUpperCase(),
      children: [
        { name: "Suggestions", children: limitedSuggestions.map(s => ({ name: s })) }
      ]
    });
  }
}
