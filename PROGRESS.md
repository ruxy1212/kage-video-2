# Issues
Accessing this app, how robust is it? Can it create a public scene, or well-known places like the Eiffel tower? We're not editing anything now, let's get the plan right. Also from the demo, the background is too dark, for the silhouette cutout, it's barely visible. Another issue, it doesn't fall (i.e. the falling from cliff instead falls horizontally instead of vertically).

# Findings

## Robustness Assessment

**What it does well:**
- Sequential narrative scenes (chase, fight, celebration arcs)
- Weather/mood atmosphere (rain, sunset, storm)
- Multi-character coordination (pass, face-off, crowd)
- Abstract settings (forest, dojo, desert, cliff)

**What it cannot do today:**
- Recognizable landmarks — the Eiffel Tower, Big Ben, a pyramid. These are *architectural shapes*, not backgrounds. The current background system only draws abstract environments (flat gradients, procedural trees, rain streaks). To draw the Eiffel Tower you'd need a dedicated SVG path or a canvas drawing routine for that specific silhouette.
- Interior scenes (classroom, stadium, kitchen)
- Vehicles (car chase, train, boat)
- Non-human characters that aren't humanoid (a dragon, a horse) — the skeleton is human-only

**The landmark question specifically:** Yes it's achievable, but it requires a *landmark library* — pre-drawn SVG silhouettes of famous shapes that get composited into the background. Not hard to build, but it's a deliberate addition, not something the LLM can improvise.

---

## The Two Bugs You Identified

### 1. Background too dark — silhouettes invisible

The root cause is a **contrast problem by design choice**. Right now:
- Characters are `rgba(8,8,18,0.96)` — near black
- Backgrounds are also very dark (`#0a0a14`, `#1a1f2e`)

The fix is a **contrast strategy**, not just "make background lighter." There are three valid approaches:

| Approach | What it looks like | Trade-off |
|---|---|---|
| **Light sky, dark ground** | Classic anime silhouette — orange/purple sky, black figures | Most cinematic, most readable |
| **Rim lighting** | Dark bg, characters get a 1-2px bright outline | Preserves dark mood |
| **Tinted characters** | Characters are a dark tint of the bg color, not pure black | Subtle, artistic |

The right call is **option 1 + option 2 together** — lighter sky zones in every background, plus a thin glow/rim on characters. This is how *Samurai Jack*, *Afro Samurai*, and every silhouette anime actually does it.

### 2. Fall action is horizontal instead of vertical

This is a **pose definition bug**. The current `fall` pose:
```js
fall: [
  { lsh: 82, rsh: 82, le: 22, re: 22, lh: 22, rh: -22, lk: -12, rk: 12, torso: 62, head: 32 },
]
```
`torso: 62` leans the torso 62° forward — which reads as *stumbling forward*, not *falling downward*. A vertical fall needs the character's body to rotate ~90° so they appear to drop feet-first or tumble. 

The deeper issue is that `fall` is used as a *looping cycle* but it should be a **one-shot transition** — the character should actually translate downward on the Y axis while rotating, not just hold a tilted pose in place. That requires the renderer to move the character's `cy` position during the action, not just animate the limbs.

---

## The Plan Before Any Code

Here's what needs to change, in priority order:

**1. Contrast system overhaul**
Every background gets a bright zone (sky gradient in warm/cool tones) and a dark ground zone. Characters get a 2px rim-light drawn as a slightly offset duplicate in a light color before the dark fill. Result: instant anime look.

**2. Fix the fall as a positional action**
Introduce the concept of **positional actions** — actions where the character's Y and/or rotation changes over time, not just limb angles. `fall` drops the character from ground level downward (off screen or to a collapsed heap). `jump` already partly does this but could be improved. The LLM scene JSON would flag a character's `groundY` override per shot.

**3. Landmark library (if you want it)**
A small set of ~10 famous silhouettes drawn as canvas path functions: Eiffel Tower, pyramid, Big Ben, Tokyo Tower, Statue of Liberty, torii gate, castle. The LLM picks from a known list, same as poses and backgrounds.

**4. Better background variety**
Add at least: stadium (floodlights), ocean/beach, rooftop at night, snowy field. These massively expand what stories can be told.
