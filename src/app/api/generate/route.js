// app/api/generate/route.js
import { GoogleGenAI } from "@google/genai";

// ── The schema the LLM must follow ──────────────────────────────────────────
// Keep this in sync with VALID_FIGURE_TYPES and VALID_ANIM_TYPES in renderer/index.js
const SYSTEM_PROMPT = `You are a scene description assistant for a 2D silhouette animation engine.

Your ONLY job is to output a valid JSON object — no markdown, no explanation, no code.

The engine renders figures on an 800×450 canvas. Objects are drawn as flat silhouette shapes.
Origin (0,0) is top-left. Canvas centre is x=400, y=225.

OUTPUT FORMAT — return exactly this structure:
{
  "background": "<css hex color>",
  "duration": <integer 3–8>,
  "objects": [
    {
      "type": "<figure type>",
      "x": <number 0–800>,
      "y": <number 0–450>,
      "scale": <number 0.5–4.0>,
      "color": "<css hex color>",
      "z": <integer, 0=front, negative=back>,
      "animation": {
        "type": "<animation type>",
        <...animation-specific params>
      }
    }
  ]
}

AVAILABLE FIGURE TYPES (use only these exact strings):
- "humanoid"    — upright human silhouette
- "astronaut"   — human in spacesuit with helmet
- "quadruped"   — four-legged animal (dog, horse, cat)
- "vehicle"     — spaceship / aircraft silhouette
- "circle"      — filled circle, good for planets, balls, sun
- "rect"        — filled rectangle, good for buildings, platforms
- "cloud"       — puffy cloud shape
- "tree"        — triangle-canopy tree with trunk
- "star"        — 5-pointed star
- "moon"        — crescent moon
- "ground"      — wide ground strip (place at y=420 z=-10)
- "mountain"    — triangle mountain with snow cap

AVAILABLE ANIMATION TYPES (use only these exact strings):
- "static"      — no movement
- "float"       — gentle vertical bobbing
  params: amplitude (px, default 12), speed (cycles/sec, default 1)
- "walk"        — horizontal movement across canvas
  params: speed (px/sec, default 60), rangeX (px, default 700), startX (default -350)
- "orbit"       — circular/elliptical orbit around base x,y
  params: radius (px, default 100), speed (orbits/sec, default 0.5), phase (radians, default 0)
- "drift"       — slow diagonal movement, good for clouds/background
  params: speedX (px/sec, default 25), speedY (px/sec, default 0), range (px, default 900)
- "bounce"      — vertical bounce
  params: height (px, default 80), speed (bounces/sec, default 2)
- "pulse"       — scale pulsing
  params: minScale (default 0.85), maxScale (default 1.15), speed (default 1.5)
- "spin"        — continuous rotation
  params: speed (rotations/sec, default 1)
- "fadein"      — fade from transparent to opaque
  params: over (seconds, default 1)

RULES:
1. duration must be 3–8 (integer). This is how long the animation plays — it does NOT loop.
2. Use 3–8 objects. More = cluttered.
3. Always include a background element: set "background" to a fitting sky/space/scene colour.
4. Place a "ground" object at y=420, z=-10, scale=1 if the scene is outdoors/terrestrial.
5. For space scenes: background="#0a0a1e", use "circle" for planets (large scale), "star" objects for stars (small scale 0.3–0.6, use many, static).
6. z ordering: background objects get negative z (−10, −5), foreground objects get 0 or positive.
7. Colors: use vivid hex colors that match the described subject. Silhouettes should contrast against the background.
8. Positions: spread objects across the canvas. Do not stack everything at x=400 y=225.
9. DO NOT output any text outside the JSON object. No preamble, no explanation, no markdown fences.`;

// ── Zod-lite validator (inline, no extra deps) ────────────────────────────────
function parseAndValidate(text) {
  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/gi, '').trim();
  
  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`LLM returned invalid JSON: ${clean.slice(0, 200)}`);
  }

  if (!parsed.objects || !Array.isArray(parsed.objects)) {
    throw new Error('Scene missing "objects" array');
  }

  const VALID_ANIM = ['static','float','walk','orbit','drift','bounce','pulse','spin','fadein'];
  const VALID_FIG  = ['humanoid','astronaut','quadruped','vehicle','circle','rect',
                      'cloud','tree','star','moon','ground','mountain'];

  // Clamp duration
  parsed.duration = Math.max(3, Math.min(8, parseInt(parsed.duration) || 5));

  // Sanitise each object
  parsed.objects = parsed.objects.map((obj, i) => {
    if (!VALID_FIG.includes(obj.type)) {
      console.warn(`[generate] object[${i}] unknown type "${obj.type}" → circle`);
      obj.type = 'circle';
    }
    if (obj.animation && !VALID_ANIM.includes(obj.animation.type)) {
      console.warn(`[generate] object[${i}] unknown anim "${obj.animation?.type}" → static`);
      obj.animation = { type: 'static' };
    }
    return {
      type:      obj.type,
      x:         Math.max(0, Math.min(800,  Number(obj.x)     || 400)),
      y:         Math.max(0, Math.min(450,  Number(obj.y)     || 225)),
      scale:     Math.max(0.1, Math.min(10, Number(obj.scale) || 1)),
      color:     typeof obj.color === 'string' ? obj.color : '#ffffff',
      z:         Number(obj.z) || 0,
      animation: obj.animation ?? { type: 'static' },
    };
  });

  return parsed;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'prompt is required' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser prompt: ${prompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text;
    console.log('[generate] raw LLM output:', raw);

    const scene = parseAndValidate(raw);
    console.log('[generate] validated scene:', JSON.stringify(scene, null, 2));

    return Response.json({ scene });

  } catch (err) {
    console.error('[generate] error:', err);
    return Response.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}