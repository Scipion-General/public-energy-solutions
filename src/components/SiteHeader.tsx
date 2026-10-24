"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            {site.shortName}
          </span>
          <span>{site.name}</span>
        </Link>
        <nav aria-label="Main">
          <ul className={styles.nav}>
            {site.nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.link}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
