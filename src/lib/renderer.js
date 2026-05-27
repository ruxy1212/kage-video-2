// ─── BACKGROUNDS ─────────────────────────────────────────────────────────────
export function drawBg(ctx, type, frame, W, H) {
  const bgs = {
    "rainy-field": () => {
      const grd = ctx.createLinearGradient(0, 0, 0, H * 0.72);
      grd.addColorStop(0, "#2a354a");
      grd.addColorStop(1, "#1a1f2e");
      ctx.fillStyle = grd;
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
      const grd = ctx.createLinearGradient(0, 0, 0, H * 0.72);
      grd.addColorStop(0, "#251b3a");
      grd.addColorStop(1, "#111118");
      ctx.fillStyle = grd;
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
      const grd = ctx.createLinearGradient(0, 0, 0, H * 0.72);
      grd.addColorStop(0, "#3a2a2a");
      grd.addColorStop(1, "#0a0a14");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H * 0.72);
      ctx.fillStyle = "#0f0f1e";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
    },
    "eiffel-tower": () => {
      const grd = ctx.createLinearGradient(0, 0, 0, H * 0.72);
      grd.addColorStop(0, "#4a3535");
      grd.addColorStop(1, "#1a1a2e");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      
      // Eiffel Tower shape
      ctx.fillStyle = "#151520";
      ctx.beginPath();
      ctx.moveTo(W * 0.45, H * 0.72);
      ctx.quadraticCurveTo(W * 0.48, H * 0.4, W * 0.49, H * 0.1);
      ctx.lineTo(W * 0.51, H * 0.1);
      ctx.quadraticCurveTo(W * 0.52, H * 0.4, W * 0.55, H * 0.72);
      // arches
      ctx.lineTo(W * 0.52, H * 0.72);
      ctx.quadraticCurveTo(W * 0.5, H * 0.65, W * 0.48, H * 0.72);
      ctx.fill();

      // Decks
      ctx.fillRect(W * 0.47, H * 0.5, W * 0.06, H * 0.02);
      ctx.fillRect(W * 0.48, H * 0.3, W * 0.04, H * 0.015);

      ctx.fillStyle = "#0f0f1e";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
    },
    "pyramid": () => {
      const grd = ctx.createLinearGradient(0, 0, 0, H * 0.72);
      grd.addColorStop(0, "#5a3a2a");
      grd.addColorStop(1, "#2a1a0f");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      
      // Pyramid shape
      ctx.fillStyle = "#180f08";
      ctx.beginPath();
      ctx.moveTo(W * 0.1, H * 0.72);
      ctx.lineTo(W * 0.4, H * 0.3);
      ctx.lineTo(W * 0.6, H * 0.72);
      ctx.fill();
      
      // Shadow side
      ctx.fillStyle = "#100a05";
      ctx.beginPath();
      ctx.moveTo(W * 0.4, H * 0.3);
      ctx.lineTo(W * 0.6, H * 0.72);
      ctx.lineTo(W * 0.85, H * 0.72);
      ctx.fill();

      ctx.fillStyle = "#1e1206";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
    },
    "big-ben": () => {
      const grd = ctx.createLinearGradient(0, 0, 0, H * 0.72);
      grd.addColorStop(0, "#2a354a");
      grd.addColorStop(1, "#1a1f2e");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      
      // Big Ben Tower
      ctx.fillStyle = "#151520";
      ctx.fillRect(W * 0.7, H * 0.2, W * 0.08, H * 0.52);
      
      // Clock face
      ctx.fillStyle = "rgba(255, 240, 200, 0.2)";
      ctx.beginPath();
      ctx.arc(W * 0.74, H * 0.28, W * 0.025, 0, Math.PI * 2);
      ctx.fill();

      // Top spire
      ctx.fillStyle = "#151520";
      ctx.beginPath();
      ctx.moveTo(W * 0.69, H * 0.2);
      ctx.lineTo(W * 0.74, H * 0.05);
      ctx.lineTo(W * 0.79, H * 0.2);
      ctx.fill();

      ctx.fillStyle = "#0f0f1e";
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
    },
  };
  (bgs[type] || bgs["default"])();
  // universal ground line
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, H * 0.72, W, 2);
}

// ─── DRAW CHARACTER ───────────────────────────────────────────────────────────
export function drawChar(ctx, cx, cy, scale, pose, flip) {
  ctx.save();
  ctx.translate(cx, cy);
  if (flip) ctx.scale(-1, 1);
  ctx.scale(scale, scale);

  const deg = (d) => (d * Math.PI) / 180;

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

  function drawCharacterShapes() {
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
  }

  // Draw rim light first
  ctx.save();
  ctx.translate(-2, -2);
  ctx.fillStyle = "rgba(200, 210, 240, 0.45)";
  drawCharacterShapes();
  ctx.restore();

  // Draw base character
  ctx.fillStyle = "rgba(8,8,18,0.96)";
  drawCharacterShapes();

  ctx.restore();
}

// ─── BALL ─────────────────────────────────────────────────────────────────────
export function drawBall(ctx, ball, shotFrame, shotDurationFrames, W, H) {
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
export function drawParticles(ctx, type, frame, W, H) {
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
export function drawCaption(ctx, text, shotFrame, W, H) {
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