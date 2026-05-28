import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert generative creative coder.
Your task is to write a JavaScript snippet that will be passed to \`new Function('ctx', 'W', 'H', 't', code)\`.
The code must render an animation loop on an HTML5 Canvas based on the user's prompt.
'ctx' is the CanvasRenderingContext2D.
'W' and 'H' are the width and height of the canvas (800x450).
't' is the time in seconds (a float starting at 0).
Do not wrap the code in a function declaration, return ONLY the raw execution code.
Return ONLY valid Javascript code — no extra text, no markdown fences, no explanation.

Use standard 2D paths (bezierCurves, lineTo), gradients, and clever scalable emoji placement (e.g. \`ctx.font = '100px sans-serif'; ctx.fillText('👩‍🚀', x, y);\`) to handle complex subjects robustly and playfully. 
Create moving parallax effects using 't'. Clear the canvas first with 'ctx.clearRect(0, 0, W, H)' or a solid fill. Make it visually stunning but robust.`;

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
    console.log("Raw LLM output:", raw);

    const clean = raw.replace(/```javascript|```js|```/gi, "").trim();

    return Response.json({ code: clean });
  } catch (err) {
    console.error("Generate error:", err);
    return Response.json(
      { error: err.message || "Generation failed" },
      { status: 500 }
    );
  }
}
