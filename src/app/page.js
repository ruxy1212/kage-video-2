"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

// ─── POSE LIBRARY ────────────────────────────────────────────────────────────
// Each pose is 2-4 keyframes. Keys: lsh/rsh=shoulder, le/re=elbow,
// lh/rh=hip, lk/rk=knee, torso=lean, head=tilt (all degrees)
const POSES = {
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
    { lsh: 82, rsh: 82, le: 22, re: 22, lh: 22, rh: -22, lk: -12, rk: 12, torso: 62, head: 32 },
    { lsh: 92, rsh: 92, le: 32, re: 32, lh: 26, rh: -26, lk: -16, rk: 16, torso: 66, head: 36 },
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

function getPose(name, phase) {
  const frames = POSES[name] || POSES.idle;
  const cycleT = (phase % 1) * (frames.length - 1);
  const i0 = Math.floor(cycleT) % frames.length;
  const i1 = Math.ceil(cycleT) % frames.length;
  return lerpPose(frames[i0], frames[i1], cycleT - Math.floor(cycleT));
}

// ─── DRAW CHARACTER ───────────────────────────────────────────────────────────
function drawChar(ctx, cx, cy, scale, pose, flip) {
  ctx.save();
  ctx.translate(cx, cy);
  if (flip) ctx.scale(-1, 1);
  ctx.scale(scale, scale);

  const deg = (d) => (d * Math.PI) / 180;
  const col = "rgba(8,8,18,0.96)";
  ctx.fillStyle = col;

  const HL = 28, LA = 18, UA = 20, UL = 22, LL = 22, TW = 8, LW = 5, AW = 4;

  function limb(ox, oy, angle, len, w) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(deg(angle));
    ctx.beginPath();
    ctx.roundRect(-w / 2, 0, w, len, 2);
    ctx.fill();
    ctx.restore();
  }

  const lean = pose.torso || 0;
  ctx.save();
  ctx.translate(0, -HL / 2);
  ctx.rotate(deg(lean));

  const sY = -HL / 2;
  const hY = HL / 2;

  // torso
  ctx.beginPath();
  ctx.roundRect(-TW / 2, sY, TW, HL, 3);
  ctx.fill();

  // left arm
  limb(-TW / 2, sY, pose.lsh, UA, AW);
  ctx.save();
  ctx.translate(-TW / 2, sY);
  ctx.rotate(deg(pose.lsh));
  limb(0, UA, pose.le, LA, AW);
  ctx.restore();

  // right arm
  limb(TW / 2, sY, pose.rsh, UA, AW);
  ctx.save();
  ctx.translate(TW / 2, sY);
  ctx.rotate(deg(pose.rsh));
  limb(0, UA, pose.re, LA, AW);
  ctx.restore();

  // left leg
  limb(-LW, hY, pose.lh, UL, LW);
  ctx.save();
  ctx.translate(-LW, hY);
  ctx.rotate(deg(pose.lh));
  limb(0, UL, pose.lk, LL, LW);
  ctx.restore();

  // right leg
  limb(LW, hY, pose.rh, UL, LW);
  ctx.save();
  ctx.translate(LW, hY);
  ctx.rotate(deg(pose.rh));
  limb(0, UL, pose.rk, LL, LW);
  ctx.restore();

  ctx.restore();

  // head
  ctx.save();
  ctx.translate(0, -HL - 13);
  ctx.rotate(deg((pose.head || 0) + lean * 0.5));
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

// ─── BACKGROUNDS ─────────────────────────────────────────────────────────────
function drawBg(ctx, type, frame, W, H) {
  const bgs = {
    "rainy-field": () => {
      ctx.fillStyle = "#1a1f2e";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#0d1a0d";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
      // goalposts
      ctx.fillStyle = "#ffffff18";
      ctx.fillRect(W - 62, H * 0.47, 4, H * 0.25);
      ctx.fillRect(W - 102, H * 0.47, 44, 4);
      ctx.fillRect(W - 102, H * 0.47, 4, H * 0.25);
      // rain
      ctx.strokeStyle = "rgba(160,185,255,0.22)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 90; i++) {
        const rx = (i * 137.5 + frame * 2.5) % W;
        const ry = (i * 53.7 + frame * 6) % H;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 9);
        ctx.stroke();
      }
      ctx.fillStyle = "#1a2e1a";
      ctx.fillRect(0, H * 0.72, W, 3);
    },
    cliff: () => {
      ctx.fillStyle = "#0f1520";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#1a0e08";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.55);
      ctx.lineTo(W * 0.42, H * 0.44);
      ctx.lineTo(W * 0.42, H);
      ctx.fill();
      ctx.fillStyle = "#0a0a14";
      ctx.fillRect(W * 0.42, H * 0.65, W * 0.58, H * 0.35);
      // stars
      for (let i = 0; i < 40; i++) {
        const sx = (i * 211.3) % W;
        const sy = (i * 97.1) % (H * 0.45);
        ctx.globalAlpha = (Math.sin(frame * 0.04 + i) * 0.3 + 0.7) * 0.7;
        ctx.fillStyle = "#fff";
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    },
    "city-street": () => {
      ctx.fillStyle = "#111118";
      ctx.fillRect(0, 0, W, H);
      const blds = [[50, 180, 80, 160],[140, 200, 60, 140],[210, 160, 90, 180],[320, 190, 70, 150],[430, 170, 100, 170],[550, 185, 80, 155],[630, 200, 50, 140]];
      blds.forEach(([x, , w, h]) => {
        ctx.fillStyle = "#1a1a28";
        ctx.fillRect(x, H - h, w, h);
        for (let wy = H - h + 10; wy < H - 10; wy += 18)
          for (let wx = x + 8; wx < x + w - 8; wx += 14)
            if (Math.sin(wx * 7 + wy * 3) > 0.3) {
              ctx.fillStyle = "rgba(255,238,136,0.25)";
              ctx.fillRect(wx, wy, 8, 10);
            }
      });
      ctx.fillStyle = "#0d0d18";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
      ctx.fillStyle = "rgba(80,100,180,0.07)";
      ctx.fillRect(0, H * 0.72, W, 10);
    },
    sunset: () => {
      ctx.fillStyle = "#1a0d05";
      ctx.fillRect(0, 0, W, H);
      const grd = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.72);
      grd.addColorStop(0, "rgba(200,80,20,0.5)");
      grd.addColorStop(1, "rgba(200,80,20,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, H * 0.3, W, H * 0.42);
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
      ctx.fillStyle = "rgba(255,140,30,0.65)";
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.72, 30, Math.PI, 0);
      ctx.fill();
    },
    forest: () => {
      ctx.fillStyle = "#050e05";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#0a1a0a";
      ctx.fillRect(0, H * 0.65, W, H * 0.35);
      for (let i = 0; i < 14; i++) {
        const tx = i * 52 + 10;
        const th = 80 + ((i * 37) % 60);
        ctx.fillStyle = "#0d1a0d";
        ctx.beginPath();
        ctx.moveTo(tx, H * 0.65);
        ctx.lineTo(tx - 22, H * 0.65 - th * 0.6);
        ctx.lineTo(tx, H * 0.65 - th);
        ctx.lineTo(tx + 22, H * 0.65 - th * 0.6);
        ctx.fill();
      }
    },
    desert: () => {
      ctx.fillStyle = "#1a1005";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#2a1a08";
      ctx.fillRect(0, H * 0.68, W, H * 0.32);
      // dunes
      ctx.fillStyle = "#1e1206";
      ctx.beginPath();
      ctx.moveTo(0, H * 0.68);
      ctx.quadraticCurveTo(W * 0.25, H * 0.55, W * 0.5, H * 0.68);
      ctx.quadraticCurveTo(W * 0.75, H * 0.82, W, H * 0.68);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();
      // stars
      for (let i = 0; i < 25; i++) {
        const sx = (i * 193.1) % W;
        const sy = (i * 71.3) % (H * 0.5);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#fff";
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    },
    dojo: () => {
      ctx.fillStyle = "#12080a";
      ctx.fillRect(0, 0, W, H);
      // floor
      ctx.fillStyle = "#1a0e08";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
      // pillars
      [0.1, 0.9].forEach((px) => {
        ctx.fillStyle = "#1e1210";
        ctx.fillRect(px * W - 8, H * 0.2, 16, H * 0.55);
      });
      // circle on ground
      ctx.strokeStyle = "rgba(255,200,100,0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.72, 100, 0, Math.PI * 2);
      ctx.stroke();
    },
    default: () => {
      ctx.fillStyle = "#0a0a14";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#0f0f1e";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
    },
  };
  (bgs[type] || bgs["default"])();
  // universal ground line
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, H * 0.72, W, 2);
}

// ─── BALL ─────────────────────────────────────────────────────────────────────
function drawBall(ctx, ball, shotFrame, shotDurationFrames, W, H) {
  if (!ball) return;
  const t = Math.min(shotFrame / shotDurationFrames, 1);
  const x = (ball.startX + (ball.endX - ball.startX) * t) * W;
  let y = (ball.groundY ?? 0.76) * H;
  if (ball.arc) y -= Math.sin(t * Math.PI) * 90;
  else if (ball.bouncing) y -= Math.abs(Math.sin(shotFrame * 0.35)) * 22;
  ctx.fillStyle = "rgba(10,10,20,0.92)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────
function drawParticles(ctx, type, frame, W, H) {
  if (type === "celebrate") {
    for (let i = 0; i < 18; i++) {
      const px = (i * 113 + frame * 3) % W;
      const py = ((i * 73 + frame * 2) % (H * 0.55)) + H * 0.1;
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = `hsl(${(i * 30 + frame * 2) % 360},70%,70%)`;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (type === "sparks") {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + frame * 0.08;
      const r = 20 + ((frame * 2 + i * 17) % 30);
      const px = W / 2 + Math.cos(angle) * r;
      const py = H * 0.5 + Math.sin(angle) * r * 0.5;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "rgba(255,200,50,0.8)";
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// ─── CAPTION ──────────────────────────────────────────────────────────────────
function drawCaption(ctx, text, shotFrame, W, H) {
  if (!text || shotFrame > 50) return;
  const alpha = Math.max(0, 0.6 * (1 - shotFrame / 50));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ffffff";
  ctx.font = "500 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, W / 2, H - 18);
  ctx.restore();
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FPS = 30;
const W = 800;
const H = 400;

const EXAMPLES = [
  "3 boys play football in the rain",
  "samurai fights a shadow warrior at dusk",
  "girl runs to catch the last train",
  "two soldiers face each other in a dojo",
  "child chases a balloon at sunset",
  "knight falls from a cliff into darkness",
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Home() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    scene: null,
    frame: 0,
    totalFrames: 0,
    playing: false,
    rafId: null,
  });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shotInfo, setShotInfo] = useState("— / —");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");

  const renderFrame = useCallback((f) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { scene } = stateRef.current;
    if (!scene) return;

    const t = f / FPS;
    const shot =
      scene.shots.find((s) => t >= s.startTime && t < s.endTime) ||
      scene.shots[scene.shots.length - 1];

    const shotDur = shot.endTime - shot.startTime;
    const shotFrame = Math.round((t - shot.startTime) * FPS);
    const shotDurFrames = Math.round(shotDur * FPS);

    drawBg(ctx, shot.background || scene.background || "default", f, W, H);
    if (shot.particles) drawParticles(ctx, shot.particles, f, W, H);
    if (shot.ball !== undefined)
      drawBall(ctx, shot.ball, shotFrame, shotDurFrames, W, H);

    (shot.characters || []).forEach((ch) => {
      const prog = Math.min((t - shot.startTime) / shotDur, 1);
      const x = ((ch.startX ?? 0.3) + ((ch.endX ?? ch.startX ?? 0.3) - (ch.startX ?? 0.3)) * prog) * W;
      const baseScale = ch.size === "small" ? 0.65 : ch.size === "large" ? 1.1 : 0.88;
      const charH = (28 + 11 + 22 + 22) * baseScale;
      const cy = H * 0.72 - charH * 0.05;
      const phase = (f * 0.042) % 1;
      const pose = getPose(ch.action || "idle", phase);
      const flip = ch.flip || (ch.endX !== undefined && ch.endX < (ch.startX ?? 0.3) && !ch.flip);
      drawChar(ctx, x, cy, baseScale, pose, flip);
    });

    drawCaption(ctx, shot.caption, shotFrame, W, H);

    const si = scene.shots.indexOf(shot) + 1;
    setShotInfo(`shot ${si} / ${scene.shots.length}`);
    setProgress((f / stateRef.current.totalFrames) * 100);
  }, []);

  const stopPlay = useCallback(() => {
    const s = stateRef.current;
    s.playing = false;
    if (s.rafId) cancelAnimationFrame(s.rafId);
    setPlaying(false);
  }, []);

  const startPlay = useCallback(() => {
    const s = stateRef.current;
    if (!s.scene) return;
    s.playing = true;
    setPlaying(true);
    const tick = () => {
      if (!s.playing) return;
      s.frame++;
      if (s.frame >= s.totalFrames) s.frame = 0;
      renderFrame(s.frame);
      s.rafId = requestAnimationFrame(tick);
    };
    s.rafId = requestAnimationFrame(tick);
  }, [renderFrame]);

  const loadScene = useCallback(
    (sceneData) => {
      stopPlay();
      const s = stateRef.current;
      s.scene = sceneData;
      s.totalFrames = Math.round(sceneData.duration * FPS);
      s.frame = 0;
      renderFrame(0);
      setTimeout(startPlay, 100);
    },
    [stopPlay, startPlay, renderFrame]
  );

  // demo idle scene on mount
  useEffect(() => {
    loadScene({
      duration: 4,
      background: "default",
      shots: [
        {
          startTime: 0,
          endTime: 4,
          caption: "enter a prompt above",
          characters: [
            { id: "a", size: "medium", startX: 0.38, endX: 0.4, action: "idle" },
            { id: "b", size: "medium", startX: 0.58, endX: 0.56, action: "idle", flip: true },
          ],
        },
      ],
    });
    return () => stopPlay();
  }, [loadScene, stopPlay]);

  const handleGenerate = async (text) => {
    if (!text.trim() || loading) return;
    setError("");
    setLoading(true);
    stopPlay();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      loadScene(data.scene);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current.scene) return;
    stopPlay();
    const stream = canvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 3000000,
    });
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "animation.webm";
      a.click();
      URL.revokeObjectURL(url);
      startPlay();
    };
    recorder.start();
    let ef = 0;
    const { totalFrames } = stateRef.current;
    const recordTick = () => {
      renderFrame(ef);
      ef++;
      if (ef < totalFrames) requestAnimationFrame(recordTick);
      else setTimeout(() => recorder.stop(), 120);
    };
    recordTick();
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>KAGE</h1>
        <p className={styles.sub}>silhouette animation from prompt</p>
      </header>

      <div className={styles.examples}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            className={styles.chip}
            onClick={() => { setPrompt(ex); handleGenerate(ex); }}
          >
            {ex}
          </button>
        ))}
      </div>

      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(prompt); } }}
          placeholder="Describe a scene to animate..."
          rows={2}
        />
        <button
          className={styles.genBtn}
          onClick={() => handleGenerate(prompt)}
          disabled={loading}
        >
          {loading ? "Directing..." : "Generate"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.stageWrap}>
        <canvas ref={canvasRef} width={W} height={H} className={styles.canvas} />
        {loading && (
          <div className={styles.loadOverlay}>
            <span className={styles.loadDot} />
            <span className={styles.loadText}>directing the scene</span>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button
          className={styles.ctrlBtn}
          onClick={() => (playing ? stopPlay() : startPlay())}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.shotLabel}>{shotInfo}</span>
        <button className={styles.ctrlBtn} onClick={handleExport}>
          ↓ Export
        </button>
      </div>
    </main>
  );
}
