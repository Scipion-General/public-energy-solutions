import Link from "next/link";
import { home } from "@/content/site";
import { Placeholder } from "@/components/Placeholder";
import { OurApproach } from "@/components/OurApproach";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className="container">
          <h1 id="hero-title" className={styles.heroTitle}>
            {home.heroTitle}
          </h1>
          <p className={styles.heroText}>{home.heroText}</p>
          <div className={styles.actions}>
            <Link href="/contact" className="button">
              Contact us
            </Link>
            <Link href="/european-gas-market" className={styles.secondary}>
              Learn about the European gas market
            </Link>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="audiences-title">
        <h2 id="audiences-title">Who we work with</h2>
        <ul className={styles.cards}>
          {home.audiences.map((a) => (
            <li key={a.title} className={styles.card}>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`section ${styles.alt}`} aria-labelledby="services-title">
        <div className="container">
          <h2 id="services-title">What we do : </h2>
          <OurApproach />
          <ul className={styles.cards}>
            {home.services.map((s) => (
              <li key={s.title} className={styles.card}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section container" aria-labelledby="clients-title">
        <h2 id="clients-title">Clients and references</h2>
        <Placeholder>Client references and testimonials will be added once approved by PES and the clients concerned.</Placeholder>
      </section>
    </>
  );
}
