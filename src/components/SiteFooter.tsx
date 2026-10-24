import Link from "next/link";
import { site } from "@/content/site";
import { Placeholder } from "./Placeholder";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.name}>{site.name}</p>
          <p>
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          </p>
        </div>
        <div>
          {site.legal ? (
            <address className={styles.legal}>
              {site.legal.entity}
              <br />
              {site.legal.registration}
              <br />
              {site.legal.address}
            </address>
          ) : (
            <Placeholder tone="dark">Legal entity, registration number and address to be provided.</Placeholder>
          )}
        </div>
        <nav aria-label="Footer">
          <ul className={styles.links}>
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
