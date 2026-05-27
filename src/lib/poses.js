// ─── POSE LIBRARY ────────────────────────────────────────────────────────────
// Each pose is 2-4 keyframes. Keys: lsh/rsh=shoulder, le/re=elbow,
// lh/rh=hip, lk/rk=knee, torso=lean, head=tilt (all degrees)
export const POSES = {
  idle: [
    { lsh: -10, rsh: 10, le: -15, re: 15, lh: 5, rh: -5, lk: 0, rk: 0, torso: 0, head: 0 },
    { lsh: -10, rsh: 10, le: -15, re: 15, lh: 5, rh: -5, lk: 0, rk: 0, torso: 0, head: 3 },
  ],
  walk: [
    { lsh: -32, rsh: 32, le: -22, re: 22, lh: 32, rh: -32, lk: -22, rk: 22, torso: 4, head: 0 },
    { lsh: 32, rsh: -32, le: 22, re: -22, lh: -32, rh: 32, lk: 22, rk: -22, torso: -4, head: 0 },
  ],
  run: [
    { lsh: -58, rsh: 58, le: -38, re: 38, lh: 52, rh: -52, lk: -32, rk: 32, torso: 10, head: 6 },
    { lsh: 58, rsh: -58, le: 38, re: -38, lh: -52, rh: 52, lk: 32, rk: -32, torso: -10, head: 6 },
  ],
  kick: [
    { lsh: -20, rsh: 20, le: -10, re: 10, lh: 10, rh: -10, lk: 0, rk: 0, torso: 0, head: 0 },
    { lsh: -42, rsh: -12, le: -32, re: -8, lh: 12, rh: -72, lk: 0, rk: -32, torso: -12, head: -6 },
    { lsh: -42, rsh: -12, le: -32, re: -8, lh: 12, rh: -72, lk: 0, rk: -32, torso: -12, head: -6 },
    { lsh: -20, rsh: 20, le: -10, re: 10, lh: 10, rh: -10, lk: 0, rk: 0, torso: 0, head: 0 },
  ],
  jump: [
    { lsh: -12, rsh: 12, le: 0, re: 0, lh: 22, rh: -22, lk: -22, rk: 22, torso: 0, head: 0 },
    { lsh: -85, rsh: 85, le: -22, re: 22, lh: -22, rh: 22, lk: 32, rk: -32, torso: 0, head: -6 },
    { lsh: -65, rsh: 65, le: -12, re: 12, lh: -12, rh: 12, lk: 22, rk: -22, torso: 0, head: 0 },
    { lsh: -22, rsh: 22, le: 12, re: -12, lh: 32, rh: -32, lk: -18, rk: 18, torso: 6, head: 0 },
  ],
  celebrate: [
    { lsh: -122, rsh: 122, le: -42, re: 42, lh: 6, rh: -6, lk: 0, rk: 0, torso: 0, head: -12 },
    { lsh: -132, rsh: 132, le: -52, re: 52, lh: 6, rh: -6, lk: 0, rk: 0, torso: 0, head: -16 },
  ],
  tired: [
    { lsh: 32, rsh: -32, le: 52, re: -52, lh: 22, rh: -22, lk: -12, rk: 12, torso: 22, head: 22 },
    { lsh: 36, rsh: -36, le: 56, re: -56, lh: 22, rh: -22, lk: -12, rk: 12, torso: 24, head: 24 },
  ],
  crouch: [
    { lsh: -18, rsh: 18, le: -12, re: 12, lh: 62, rh: -62, lk: -52, rk: 52, torso: 16, head: 12 },
    { lsh: -22, rsh: 22, le: -16, re: 16, lh: 66, rh: -66, lk: -56, rk: 56, torso: 18, head: 14 },
  ],
  fall: [
    { lsh: 130, rsh: -150, le: 80, re: 60, lh: 110, rh: -90, lk: -60, rk: 60, torso: 90, head: -20 },
    { lsh: 140, rsh: -140, le: 90, re: 70, lh: 120, rh: -100, lk: -70, rk: 70, torso: 95, head: -15 },
  ],
  fight: [
    { lsh: -62, rsh: 32, le: -82, re: 22, lh: 22, rh: -16, lk: -12, rk: 12, torso: -12, head: -8 },
    { lsh: -32, rsh: 62, le: -22, re: 82, lh: 16, rh: -22, lk: -12, rk: 12, torso: 12, head: 8 },
  ],
  sit: [
    { lsh: -16, rsh: 16, le: -12, re: 12, lh: 92, rh: -92, lk: -88, rk: 88, torso: 6, head: 0 },
    { lsh: -16, rsh: 16, le: -12, re: 12, lh: 92, rh: -92, lk: -88, rk: 88, torso: 6, head: 4 },
  ],
  point: [
    { lsh: -12, rsh: -102, le: -6, re: -62, lh: 6, rh: -6, lk: 0, rk: 0, torso: -6, head: -12 },
    { lsh: -12, rsh: -102, le: -6, re: -62, lh: 6, rh: -6, lk: 0, rk: 0, torso: -6, head: -14 },
  ],
};

function lerpPose(a, b, t) {
  const r = {};
  for (const k in a) r[k] = a[k] + (b[k] - a[k]) * t;
  return r;
}

export function getPose(name, phase) {
  const frames = POSES[name] || POSES.idle;
  const cycleT = (phase % 1) * (frames.length - 1);
  const i0 = Math.floor(cycleT) % frames.length;
  const i1 = Math.ceil(cycleT) % frames.length;
  return lerpPose(frames[i0], frames[i1], cycleT - Math.floor(cycleT));
}