import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.band}>
      <div className="container">
        <h1 className={styles.title}>{title}</h1>
        {children && <div className={styles.lead}>{children}</div>}
      </div>
    </div>
  );
}
