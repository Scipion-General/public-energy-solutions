import Image from "next/image";
import { images } from "@/content/images";
import styles from "./FullLogo.module.css";

/**
 * The full PES logo (pes_full_logo.png) on a white rounded card, so it stays
 * legible on both white and navy backgrounds.
 */
export function FullLogo({ className, eager = false }: { className?: string; eager?: boolean }) {
  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      <Image
        src={images.logoFull.src}
        width={images.logoFull.width}
        height={images.logoFull.height}
        alt={images.logoFull.alt}
        sizes="(max-width: 60rem) 70vw, 24rem"
        className={styles.img}
        loading={eager ? "eager" : "lazy"}
      />
    </div>
  );
}
