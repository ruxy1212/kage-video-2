"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { FPS, W, H } from "../lib/constants";
import { getPose } from "../lib/poses";
import { drawBg, drawChar, drawBall, drawParticles, drawCaption } from "../lib/renderer";
import Header from "../components/Header";
import ExampleList from "../components/ExampleList";
import PromptInput from "../components/PromptInput";
import Controls from "../components/Controls";

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
      let cy = H * 0.72 - charH * 0.05;
      if (ch.action === "fall") {
        cy += prog * H * 0.6;
      }
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

      {error && <p className="text-xs text-[#cc4444] mb-2 px-2.5 py-1.5 border border-[#3a1a1a] rounded-md bg-[#1a0a0a]">{error}</p>}

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
        togglePlay={() => (playing ? stopPlay() : startPlay())} 
        progress={progress} 
        shotInfo={shotInfo} 
        handleExport={handleExport} 
      />
    </main>
  );
}
