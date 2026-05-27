import styles from "../app/page.module.css";

export default function Controls({ playing, togglePlay, progress, shotInfo, handleExport }) {
  return (
    <div className={styles.controls}>
      <button
        className={styles.ctrlBtn}
        onClick={togglePlay}
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
  );
}