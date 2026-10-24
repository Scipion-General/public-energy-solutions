import type { ReactNode } from "react";
import styles from "./Placeholder.module.css";

/** Clearly labelled placeholder for content still to be supplied by PES. */
export function Placeholder({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <p className={`${styles.placeholder} ${tone === "dark" ? styles.dark : ""}`}>
      <strong>Placeholder:</strong> {children}
    </p>
  );
}
