export default function PromptInput({ prompt, setPrompt, handleGenerate, loading }) {
  return (
    <div className="flex gap-2 mb-1.5">
      <textarea
        className="flex-1 py-2.5 px-3.5 text-sm border border-[#2a2a3e] rounded-lg bg-[#0f0f1e] text-[#e8e8f0] resize-none leading-relaxed transition-colors duration-150 focus:outline-none focus:border-[#444460] placeholder:text-[#333350]"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleGenerate(prompt);
          }
        }}
        placeholder="Describe a scene to animate..."
        rows={2}
      />
      <button
        className="px-6 text-sm font-medium border border-[#2a2a3e] rounded-lg bg-[#0f0f1e] text-[#e8e8f0] cursor-pointer whitespace-nowrap transition-colors duration-150 min-w-27.5 hover:not(:disabled):bg-[#1a1a2e] hover:not(:disabled):border-[#444460] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handleGenerate(prompt)}
        disabled={loading}
      >
        {loading ? "Directing..." : "Generate"}
      </button>
    </div>
  );
}