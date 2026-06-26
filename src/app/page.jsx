"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { FPS, W, H } from "../lib/constants";
import Header from "../components/Header";
import ExampleList from "../components/ExampleList";
import PromptInput from "../components/PromptInput";
import Controls from "../components/Controls";
import { renderScene } from "../lib";

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Home() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    scene: null,          // validated scene JSON from API
    startTime: null,      // performance.now() when scene started playing
    rafId: null,
    playing: false,
  });

  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [shotInfo, setShotInfo] = useState("— / —");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [prompt, setPrompt]     = useState("");

  // ── Stop playback ──────────────────────────────────────────────────────────
  const stopPlay = useCallback(() => {
    const s = stateRef.current;
    s.playing = false;
    if (s.rafId) cancelAnimationFrame(s.rafId);
    s.rafId = null;
    setPlaying(false);
  }, []);

  // ── Render one frame at time t (seconds) ───────────────────────────────────
  const renderFrame = useCallback((t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { scene } = stateRef.current;
    if (!scene) return;

    renderScene(scene, ctx, W, H, t);

    const dur = scene.duration;
    const clamped = Math.min(t, dur);
    setShotInfo(`${clamped.toFixed(1)}s / ${dur.toFixed(1)}s`);
    setProgress((clamped / dur) * 100);
  }, []);

  // ── Playback loop — runs forward, stops exactly at duration ───────────────
  const startPlay = useCallback(() => {
    const s = stateRef.current;
    if (!s.scene) return;

    s.playing = true;
    setPlaying(true);

    // Record the real-world start time so elapsed t is wall-clock accurate
    s.startTime = performance.now();

    const tick = () => {
      if (!s.playing) return;

      const elapsed = (performance.now() - s.startTime) / 1000; // seconds

      if (elapsed >= s.scene.duration) {
        // Render the final frame exactly at duration, then stop
        renderFrame(s.scene.duration);
        setProgress(100);
        stopPlay();
        return;
      }

      renderFrame(elapsed);
      s.rafId = requestAnimationFrame(tick);
    };

    s.rafId = requestAnimationFrame(tick);
  }, [renderFrame, stopPlay]);

  // ── Load a new scene: render frame 0, then auto-play ──────────────────────
  const loadScene = useCallback(
    (scene) => {
      stopPlay();
      stateRef.current.scene = scene;
      renderFrame(0);
      // Small delay so the first frame paints before playback starts
      setTimeout(startPlay, 80);
    },
    [stopPlay, startPlay, renderFrame]
  );

  // ── Demo idle scene on mount ───────────────────────────────────────────────
  useEffect(() => {
    // Paint a static placeholder — no rAF needed
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("enter a prompt above", W / 2, H / 2);
    return () => stopPlay();
  }, [stopPlay]);

  // ── Generate from API ──────────────────────────────────────────────────────
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
      // API now returns { scene } instead of { code }
      loadScene(data.scene);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Export: record the scene playing forward from t=0 to t=duration ───────
  const handleExport = () => {
    const canvas = canvasRef.current;
    const { scene } = stateRef.current;
    if (!canvas || !scene) return;

    stopPlay();

    const stream = canvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 3_000_000,
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
      // Resume live playback after export
      stateRef.current.startTime = performance.now();
      startPlay();
    };

    recorder.start();

    const totalFrames = Math.ceil(scene.duration * FPS);
    let frame = 0;

    const recordTick = () => {
      const t = frame / FPS;
      renderFrame(t);
      frame++;
      if (frame <= totalFrames) {
        requestAnimationFrame(recordTick);
      } else {
        setTimeout(() => recorder.stop(), 120);
      }
    };
    recordTick();
  };

  // ── Toggle play/pause ──────────────────────────────────────────────────────
  const handleTogglePlay = () => {
    const s = stateRef.current;
    if (playing) {
      stopPlay();
    } else {
      // Resume from wherever the last frame left off
      // Re-anchor startTime so elapsed continues correctly
      const currentT = s.scene
        ? (parseFloat(shotInfo) || 0)
        : 0;
      s.startTime = performance.now() - currentT * 1000;
      startPlay();
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen px-6 py-8 pb-12 max-w-215 mx-auto font-sans text-[#e8e8f0]">
      <Header />

      <ExampleList
        onSelect={(ex) => {
          setPrompt(ex);
          handleGenerate(ex);
        }}
      />

      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        handleGenerate={handleGenerate}
        loading={loading}
      />

      {error && (
        <p className="text-xs text-[#cc4444] mb-2 px-2.5 py-1.5 border border-[#3a1a1a] rounded-md bg-[#1a0a0a]">
          {error}
        </p>
      )}

      <div className="relative border border-[#1e1e30] rounded-[10px] overflow-hidden bg-[#0a0a14]">
        <canvas ref={canvasRef} width={W} height={H} className="block w-full h-auto" />
        {loading && (
          <div className="absolute inset-0 bg-[#0a0a14]/75 flex items-center justify-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#6666aa] animate-pulse-fast" />
            <span className="text-[13px] text-[#888899] tracking-[0.08em]">directing the scene</span>
          </div>
        )}
      </div>

      <Controls
        playing={playing}
        togglePlay={handleTogglePlay}
        progress={progress}
        shotInfo={shotInfo}
        handleExport={handleExport}
      />
    </main>
  );
}