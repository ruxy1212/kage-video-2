import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an animation director for a silhouette anime generator.
Convert the user's scene prompt into a structured JSON animation script.
Return ONLY valid JSON — no extra text, no markdown fences, no explanation.

Schema:
{
  "duration": <number 3-8, total seconds>,
  "background": <"rainy-field" | "cliff" | "city-street" | "sunset" | "forest" | "desert" | "dojo" | "eiffel-tower" | "pyramid" | "big-ben" | "default">,
  "shots": [
    {
      "startTime": <number>,
      "endTime": <number>,
      "caption": <string, 3-5 words max>,
      "background": <optional override>,
      "particles": <optional "celebrate" | "sparks">,
      "characters": [
        {
          "id": <string>,
          "size": <"small" | "medium" | "large">,
          "startX": <0.0-1.0>,
          "endX": <0.0-1.0>,
          "action": <"idle"|"walk"|"run"|"kick"|"jump"|"celebrate"|"tired"|"crouch"|"fall"|"fight"|"sit"|"point">,
          "flip": <boolean, true = face left>
        }
      ],
      "ball": <optional {
        "startX": <0.0-1.0>,
        "endX": <0.0-1.0>,
        "groundY": <0.0-1.0, default 0.76>,
        "arc": <boolean>,
        "bouncing": <boolean>
      }>
    }
  ]
}

Rules:
- 3-5 shots that form a complete story arc with clear beginning, middle, end
- Shots must be strictly sequential: shot[n].endTime === shot[n+1].startTime
- Characters move from startX to endX during the shot (0=left, 1=right)
- Keep characters between 0.08 and 0.92 to stay on screen
- size: small=child/young, medium=adult, large=tall or imposing figure
- flip:true means character faces left (use when moving left or facing another char on the right)
- Use ball object whenever prompt involves a ball, projectile, or thrown object
- Match background to the setting and mood of the prompt
- Caption is a punchy 3-5 word scene description`;

export async function POST(request) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    // const message = await client.messages.create({
    //   model: "claude-sonnet-4-20250514",
    //   max_tokens: 1024,
    //   system: SYSTEM_PROMPT,
    //   messages: [{ role: "user", content: prompt }],
    // });

    // const raw = message.content
    //   .filter((b) => b.type === "text")
    //   .map((b) => b.text)
    //   .join("");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nUser prompt: ${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text;
    console.log(raw);

    const clean = raw.replace(/```json|```/g, "").trim();
    const scene = JSON.parse(clean);

    return Response.json({ scene });
  } catch (err) {
    console.error("Generate error:", err);
    return Response.json(
      { error: err.message || "Generation failed" },
      { status: 500 }
    );
  }
}
