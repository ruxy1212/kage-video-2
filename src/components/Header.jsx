import styles from "../app/page.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>KAGE</h1>
      <p className={styles.sub}>silhouette animation from prompt</p>
    </header>
  );
}