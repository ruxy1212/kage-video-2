import styles from "../app/page.module.css";
import { EXAMPLES } from "../lib/constants";

export default function ExampleList({ onSelect }) {
  return (
    <div className={styles.examples}>
      {EXAMPLES.map((ex) => (
        <button
          key={ex}
          className={styles.chip}
          onClick={() => onSelect(ex)}
        >
          {ex}
        </button>
      ))}
    </div>
  );
}