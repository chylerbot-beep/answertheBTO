import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ error: "No query" }, { status: 400 });

  try {
    // 1. Fetch Google Autocomplete (The "Common" Data)
    const modifiers = ["why", "how", "when", "can", "what", "is", "should"];
    let rawSuggestions: string[] = [];

    for (const m of modifiers) {
      try {
        const res = await fetch(
          `https://suggestqueries.google.com/complete/search?client=firefox&gl=sg&q=${encodeURIComponent(m + " " + query)}`,
          { next: { revalidate: 3600 } }
        );
        const data = await res.json();
        if (data[1] && Array.isArray(data[1])) {
          rawSuggestions.push(...data[1]);
        }
      } catch (e) {
        console.error(`Failed to fetch suggestions for ${m}:`, e);
      }
    }

    // Remove duplicates
    rawSuggestions = Array.from(new Set(rawSuggestions));

    if (rawSuggestions.length === 0) {
      return NextResponse.json({
        Questions: [{ name: "No suggestions found" }],
        Topics: [{ name: "Try a different keyword" }],
        Info: [{ name: "Use specific terms like 'BTO', 'HDB', 'Tengah'" }]
      });
    }

    // 2. Use Gemini to structure and organize (The "Brain")
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      I have a list of search suggestions related to "${query}": ${rawSuggestions.slice(0, 30).join(", ")}.
      Act as a Singapore HDB/BTO housing expert. Organize these into a JSON structure for a mind map.
      Create exactly 3 main branches with these exact keys: "Questions", "Eligibility", and "Financials".
      Each branch should be an array of objects with a "name" property containing the relevant suggestion.
      Distribute the suggestions logically:
      - "Questions": General questions (why, how, what, when)
      - "Eligibility": Requirements, criteria, who can apply
      - "Financials": Prices, grants, loans, costs
      
      Return ONLY valid JSON with this exact structure:
      {
        "Questions": [{"name": "suggestion1"}, {"name": "suggestion2"}],
        "Eligibility": [{"name": "suggestion3"}, {"name": "suggestion4"}],
        "Financials": [{"name": "suggestion5"}, {"name": "suggestion6"}]
      }
      
      If a category has no relevant suggestions, include at least one placeholder like {"name": "No data for this category"}.
      Return ONLY the JSON, no markdown, no explanation.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean the response (Gemini sometimes adds markdown backticks)
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();
    
    try {
      const parsedJson = JSON.parse(cleanedJson);
      return NextResponse.json(parsedJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", cleanedJson);
      // Return a fallback structure
      return NextResponse.json({
        Questions: rawSuggestions.slice(0, 5).map(s => ({ name: s })),
        Eligibility: rawSuggestions.slice(5, 10).map(s => ({ name: s })),
        Financials: rawSuggestions.slice(10, 15).map(s => ({ name: s }))
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
