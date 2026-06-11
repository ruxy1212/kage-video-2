// renderer/figures.js
// Every figure draws centered at (0,0).
// The render loop handles translate/rotate/scale before calling here.
// All shapes are silhouette-style: filled with ctx.fillStyle, no outlines needed.

export function drawFigure(ctx, type, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  switch (type) {

    case 'humanoid': {
      // Head
      ctx.beginPath();
      ctx.arc(0, -38, 10, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillRect(-8, -26, 16, 26);
      // Arms (angled slightly down)
      ctx.fillRect(-22, -25, 12, 7);
      ctx.fillRect(10,  -25, 12, 7);
      // Legs
      ctx.fillRect(-10, 0, 8, 24);
      ctx.fillRect(2,   0, 8, 24);
      break;
    }

    case 'astronaut': {
      // Helmet (larger head with visor)
      ctx.beginPath();
      ctx.arc(0, -38, 14, 0, Math.PI * 2);
      ctx.fill();
      // Visor cutout
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.ellipse(2, -38, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      // Suit body (bulkier)
      ctx.fillRect(-12, -22, 24, 26);
      // Arms (thick)
      ctx.fillRect(-26, -22, 13, 9);
      ctx.fillRect(13,  -22, 13, 9);
      // Legs
      ctx.fillRect(-11, 4, 9, 22);
      ctx.fillRect(2,   4, 9, 22);
      // Backpack
      ctx.fillRect(10, -18, 8, 16);
      break;
    }

    case 'quadruped': {
      // Body
      ctx.fillRect(-28, -16, 52, 18);
      // Head
      ctx.beginPath();
      ctx.arc(26, -14, 12, 0, Math.PI * 2);
      ctx.fill();
      // Snout
      ctx.fillRect(32, -10, 14, 7);
      // Legs
      ctx.fillRect(-22, 2, 8, 20);
      ctx.fillRect(-8,  2, 8, 20);
      ctx.fillRect(8,   2, 8, 20);
      ctx.fillRect(22,  2, 8, 20);
      // Tail
      ctx.beginPath();
      ctx.moveTo(-28, -8);
      ctx.quadraticCurveTo(-50, -28, -42, -38);
      ctx.lineWidth = 5;
      ctx.stroke();
      break;
    }

    case 'vehicle': {
      // Fuselage (elongated ellipse)
      ctx.beginPath();
      ctx.ellipse(0, 0, 44, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cockpit
      ctx.beginPath();
      ctx.ellipse(16, -12, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.lineTo(-30, 24); ctx.lineTo(10, 0);
      ctx.closePath(); ctx.fill();
      // Engine exhaust (semi-transparent)
      ctx.globalAlpha *= 0.5;
      ctx.fillRect(-52, -7, 12, 14);
      ctx.globalAlpha /= 0.5; // restore (divide by same factor)
      break;
    }

    case 'circle': {
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'rect': {
      ctx.fillRect(-30, -20, 60, 40);
      break;
    }

    case 'cloud': {
      ctx.beginPath();
      ctx.arc(-22, 4,  18, 0, Math.PI * 2);
      ctx.arc(0,   -4, 23, 0, Math.PI * 2);
      ctx.arc(22,  4,  17, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'tree': {
      // Trunk
      ctx.fillRect(-5, 10, 10, 26);
      // Canopy layers (stacked triangles, wider at base)
      [[0, -46, 28, 12], [0, -30, 24, 16]].forEach(([cx, top, hw, base]) => {
        ctx.beginPath();
        ctx.moveTo(cx, top);
        ctx.lineTo(cx + hw, base);
        ctx.lineTo(cx - hw, base);
        ctx.closePath();
        ctx.fill();
      });
      break;
    }

    case 'star': {
      const spikes = 5, outer = 26, inner = 11;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        i === 0
          ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
          : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'moon': {
      // Crescent via composite
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(12, -5, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      break;
    }

    case 'ground': {
      // Wide ground strip — position at y=H, scale to cover full width
      ctx.fillRect(-500, -15, 1000, 30);
      break;
    }

    case 'mountain': {
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(60, 30);
      ctx.lineTo(-60, 30);
      ctx.closePath();
      ctx.fill();
      // Snow cap
      const prev = ctx.fillStyle;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(20, -30);
      ctx.lineTo(-20, -30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = prev;
      break;
    }

    default:
      // Unknown type: draw a small diamond so it's visible but not distracting
      ctx.beginPath();
      ctx.moveTo(0, -20); ctx.lineTo(14, 0);
      ctx.lineTo(0, 20);  ctx.lineTo(-14, 0);
      ctx.closePath();
      ctx.fill();
      break;
  }
}