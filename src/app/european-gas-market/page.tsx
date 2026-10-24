import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { GAS_MARKET_LAST_REVIEWED, gasMarketSections } from "@/content/gasMarket";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "European Gas Market",
  description: "An introduction to how the European natural gas market works, with links to official sources.",
};

export default function GasMarketPage() {
  return (
    <>
      <PageHeader title="The European gas market">
        <p>An educational overview of how gas is traded, supplied and regulated in Europe, with links to official sources.</p>
      </PageHeader>
      <div className={`container section ${styles.layout}`}>
        <nav aria-labelledby="toc-title" className={styles.toc}>
          <h2 id="toc-title" className={styles.tocTitle}>
            On this page
          </h2>
          <ol>
            {gasMarketSections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <div>
          {gasMarketSections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className={styles.section}>
              <h2 id={`${s.id}-title`}>{s.title}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.list && (
                <ul>
                  {s.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              <h3 className={styles.sourcesTitle}>Sources</h3>
              <ul className={styles.sources}>
                {s.sources.map((src) => (
                  <li key={src.url}>
                    <a href={src.url} rel="noopener noreferrer" target="_blank">
                      {src.label}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className={styles.note}>
            This page is general educational information, not investment, legal or procurement advice. Content last
            reviewed on <time dateTime={GAS_MARKET_LAST_REVIEWED}>{GAS_MARKET_LAST_REVIEWED}</time>; regulation in this
            area changes frequently, so always check the linked sources for the current position.
          </p>
        </div>
      </div>
    </>
  );
}
