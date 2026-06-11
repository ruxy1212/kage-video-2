// renderer/index.js
import { applyAnimation } from './animate.js';
import { drawFigure } from './figures.js';

/**
 * Renders one frame of a scene onto ctx.
 * Called every rAF tick with the raw elapsed t in seconds.
 * Does NOT loop t — each primitive's applyAnimation handles its own looping
 * via (t % duration), so the scene plays forward and stops at duration.
 *
 * @param {object} scene  - validated JSON from the LLM
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W      - canvas width
 * @param {number} H      - canvas height
 * @param {number} t      - seconds elapsed since scene started (0 → scene.duration)
 */
export function renderScene(scene, ctx, W, H, t) {
  // 1. Clear + background
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = scene.background ?? '#0a0a14';
  ctx.fillRect(0, 0, W, H);

  // 2. Draw objects in z-order (lower z = further back)
  const sorted = [...(scene.objects ?? [])].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

  for (const obj of sorted) {
    const anim = applyAnimation(obj.animation ?? { type: 'static' }, t, scene.duration);

    const x = (obj.x ?? W / 2) + anim.dx;
    const y = (obj.y ?? H / 2) + anim.dy;
    const scale = (obj.scale ?? 1) * anim.scale;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, anim.alpha));
    ctx.translate(x, y);
    ctx.rotate(anim.rotation);
    // Handle horizontal flip (e.g. walk direction)
    ctx.scale(anim.flip === -1 ? -scale : scale, scale);

    try {
      drawFigure(ctx, obj.type, obj.color ?? '#ffffff');
    } catch (err) {
      // Draw fallback diamond instead of crashing the whole frame
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.moveTo(0, -16); ctx.lineTo(12, 0);
      ctx.lineTo(0, 16);  ctx.lineTo(-12, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Validates and clamps LLM-provided scene JSON.
 * Returns a clean scene object, or throws a descriptive error.
 */
export function validateScene(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Scene must be a JSON object');
  if (!Array.isArray(raw.objects))     throw new Error('Scene must have an "objects" array');

  const VALID_ANIM_TYPES = ['static','float','walk','orbit','drift','bounce','pulse','spin','fadein'];
  const VALID_FIGURE_TYPES = ['humanoid','astronaut','quadruped','vehicle','circle','rect',
                               'cloud','tree','star','moon','ground','mountain'];

  const duration = Math.max(3, Math.min(8, Number(raw.duration) || 5));

  const objects = raw.objects.map((obj, i) => {
    if (!obj.type || !VALID_FIGURE_TYPES.includes(obj.type)) {
      console.warn(`Object ${i} has unknown type "${obj.type}", defaulting to circle`);
      obj = { ...obj, type: 'circle' };
    }
    const animType = obj.animation?.type;
    if (animType && !VALID_ANIM_TYPES.includes(animType)) {
      console.warn(`Object ${i} has unknown animation "${animType}", defaulting to static`);
      obj = { ...obj, animation: { type: 'static' } };
    }
    return {
      type: obj.type,
      x: Number(obj.x) || 400,
      y: Number(obj.y) || 225,
      scale: Math.max(0.1, Math.min(10, Number(obj.scale) || 1)),
      color: typeof obj.color === 'string' ? obj.color : '#ffffff',
      z: Number(obj.z) || 0,
      animation: obj.animation ?? { type: 'static' },
    };
  });

  return {
    background: typeof raw.background === 'string' ? raw.background : '#0a0a14',
    duration,
    objects,
  };
}