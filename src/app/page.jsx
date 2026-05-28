"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { FPS, W, H } from "../lib/constants";
import Header from "../components/Header";
import ExampleList from "../components/ExampleList";
import PromptInput from "../components/PromptInput";
import Controls from "../components/Controls";

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Home() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    code: null,
    frame: 0,
    totalFrames: 10 * FPS, // Default 10 seconds
    playing: false,
    rafId: null,
  });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shotInfo, setShotInfo] = useState("— / —");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");

  const stopPlay = useCallback(() => {
    const s = stateRef.current;
    s.playing = false;
    if (s.rafId) cancelAnimationFrame(s.rafId);
    setPlaying(false);
  }, []);

  const renderFrame = useCallback((f) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { code } = stateRef.current;
    if (!code) return;

    const t = f / FPS;
    
    try {
      // Create isolated function body from code
      const drawFn = new Function('ctx', 'W', 'H', 't', code);
      drawFn(ctx, W, H, t);
      setShotInfo(`${t.toFixed(1)}s / ${(stateRef.current.totalFrames / FPS).toFixed(1)}s`);
    } catch (err) {
      console.error("Render Error:", err);
      setError("Render error: " + err.message);
      stopPlay();
    }

    setProgress((f / stateRef.current.totalFrames) * 100);
  }, [stopPlay]);

  const startPlay = useCallback(() => {
    const s = stateRef.current;
    if (!s.code) return;
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
    (codeData) => {
      stopPlay();
      const s = stateRef.current;
      s.code = codeData;
      s.totalFrames = 10 * FPS; // Just default to 10 seconds for now
      s.frame = 0;
      renderFrame(0);
      setTimeout(startPlay, 100);
    },
    [stopPlay, startPlay, renderFrame]
  );

  // demo idle scene on mount
  useEffect(() => {
    loadScene(`
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('enter a prompt above', W/2, H/2 + Math.sin(t*3)*10);
    `);
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
      loadScene(data.code);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current.code) return;
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
