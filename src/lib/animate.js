// renderer/animate.js
// Returns a position/transform delta for the current time.
// t = total seconds elapsed (never pre-looped — we handle looping here)
// duration = scene duration in seconds

export function applyAnimation(anim, t, duration) {
  // Normalise t within the scene duration so motion stays in-bounds
  const looped = duration > 0 ? t % duration : t;
  const TWO_PI = Math.PI * 2;

  switch (anim?.type) {
    case 'float': {
      const amp = anim.amplitude ?? 12;
      const spd = anim.speed ?? 1;
      return { dx: 0, dy: Math.sin(looped * spd * TWO_PI) * amp, rotation: 0, scale: 1, alpha: 1, flip: 1 };
    }

    case 'walk': {
      const speed = anim.speed ?? 60;
      const rangeX = anim.rangeX ?? 700;
      const startX = anim.startX ?? -rangeX / 2;
      const dx = (startX + (looped * speed)) % rangeX;
      const dy = Math.sin(looped * 8) * 3;
      const flip = speed >= 0 ? 1 : -1;
      return { dx, dy, rotation: 0, scale: 1, alpha: 1, flip };
    }

    case 'orbit': {
      const r = anim.radius ?? 100;
      const spd = anim.speed ?? 0.5;
      const phase = anim.phase ?? 0;
      const angle = looped * spd * TWO_PI + phase;
      return {
        dx: Math.cos(angle) * r,
        dy: Math.sin(angle) * r * 0.45,
        rotation: 0, scale: 1, alpha: 1, flip: 1
      };
    }

    case 'drift': {
      const sx = anim.speedX ?? 25;
      const sy = anim.speedY ?? 0;
      const range = anim.range ?? 900;
      return {
        dx: ((looped * sx) % range) - range / 2,
        dy: Math.sin(looped * 0.4) * (sy || 6),
        rotation: 0, scale: 1, alpha: 1, flip: 1
      };
    }

    case 'bounce': {
      const height = anim.height ?? 80;
      const spd = anim.speed ?? 2;
      const raw = Math.abs(Math.sin(looped * spd * Math.PI));
      const squash = raw < 0.08 ? 1.25 : 1;
      return { dx: 0, dy: -(raw * height), rotation: 0, scale: squash, alpha: 1, flip: 1 };
    }

    case 'pulse': {
      const min = anim.minScale ?? 0.85;
      const max = anim.maxScale ?? 1.15;
      const spd = anim.speed ?? 1.5;
      const scale = min + (Math.sin(looped * spd * TWO_PI) * 0.5 + 0.5) * (max - min);
      return { dx: 0, dy: 0, rotation: 0, scale, alpha: 1, flip: 1 };
    }

    case 'spin': {
      const spd = anim.speed ?? 1;
      return { dx: 0, dy: 0, rotation: looped * spd * TWO_PI, scale: 1, alpha: 1, flip: 1 };
    }

    case 'fadein': {
      const dur = anim.over ?? 1;
      const alpha = Math.min(1, looped / dur);
      return { dx: 0, dy: 0, rotation: 0, scale: 1, alpha, flip: 1 };
    }

    case 'static':
    default:
      return { dx: 0, dy: 0, rotation: 0, scale: 1, alpha: 1, flip: 1 };
  }
}