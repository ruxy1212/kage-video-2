# KAGE — Silhouette Animation Generator

Turn any text prompt into a silhouette anime scene.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your Anthropic API key**

   Open `.env.local` and replace the placeholder:
   ```
   ANTHROPIC_API_KEY=sk-ant-...your key here...
   ```
   Get your key at: https://console.anthropic.com

3. **Run the dev server**
   ```bash
   npm run dev
   ```

4. **Open** http://localhost:3000

That's it. Type a prompt, hit Generate, watch it animate.

## How it works

- The **API route** (`/api/generate`) calls Anthropic server-side — no CORS issues
- Claude acts as a **director**: it picks poses, timing, backgrounds from a fixed vocabulary
- The **renderer** draws every character as 11 canvas shapes (no external assets)
- **Export** captures the canvas as a `.webm` video via MediaRecorder API

## Pose library

Characters support: `idle` `walk` `run` `kick` `jump` `celebrate` `tired` `crouch` `fall` `fight` `sit` `point`

## Backgrounds

`rainy-field` `cliff` `city-street` `sunset` `forest` `desert` `dojo` `default`

## Adding poses

In `src/app/page.js`, add to the `POSES` object:
```js
yourPose: [
  { lsh: 0, rsh: 0, le: 0, re: 0, lh: 0, rh: 0, lk: 0, rk: 0, torso: 0, head: 0 },
  { ... }  // second keyframe
]
```
Then mention it in the system prompt in `/src/app/api/generate/route.js`.
