import styles from "../app/page.module.css";

export default function PromptInput({ prompt, setPrompt, handleGenerate, loading }) {
  return (
    <div className={styles.inputRow}>
      <textarea
        className={styles.input}
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
        className={styles.genBtn}
        onClick={() => handleGenerate(prompt)}
        disabled={loading}
      >
        {loading ? "Directing..." : "Generate"}
      </button>
    </div>
  );
}