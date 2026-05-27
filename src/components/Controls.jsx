export default function Controls({ playing, togglePlay, progress, shotInfo, handleExport }) {
  return (
    <div className="flex items-center gap-2.5 mt-2.5">
      <button
        className="px-3.5 py-1.75 text-[13px] border border-[#2a2a3e] rounded-[7px] bg-[#0f0f1e] text-[#aaaacc] cursor-pointer transition-colors hover:bg-[#1a1a2e] whitespace-nowrap"
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div className="flex-1 h-0.75 bg-[#1e1e30] rounded-sm overflow-hidden">
        <div className="h-full bg-[#444466] rounded-sm transition-[width] duration-75 ease-linear" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-[#444466] min-w-17.5 text-right tracking-wider">{shotInfo}</span>
      <button className="px-3.5 py-1.75 text-[13px] border border-[#2a2a3e] rounded-[7px] bg-[#0f0f1e] text-[#aaaacc] cursor-pointer transition-colors hover:bg-[#1a1a2e] whitespace-nowrap" onClick={handleExport}>
        ↓ Export
      </button>
    </div>
  );
}