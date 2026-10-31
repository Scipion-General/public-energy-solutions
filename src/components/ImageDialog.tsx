"use client";

import Image from "next/image";
import { useRef } from "react";
import styles from "./ImageDialog.module.css";

interface Props {
  /** Text of the button that opens the dialog. */
  buttonLabel: string;
  title: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

/**
 * A button that opens an image in a modal window (native <dialog>):
 * focus is trapped, Esc and the close button close it, clicking the backdrop closes it.
 */
export function ImageDialog({ buttonLabel, title, src, width, height, alt, caption }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `dlg-${src.replace(/\W/g, "")}`;

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" className={styles.icon}>
          <path
            fill="currentColor"
            d="M15 4 9 2 3 4v18l6-2 6 2 6-2V2l-6 2Zm-5 .3 4 1.3v13.1l-4-1.3V4.3ZM5 5.4l3-1v13.1l-3 1V5.4Zm14 13.2-3 1V6.5l3-1v13.1Z"
          />
        </svg>
        {buttonLabel}
      </button>
      <dialog
        ref={ref}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === ref.current) ref.current.close();
        }}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={() => ref.current?.close()} autoFocus>
            <span aria-hidden="true">×</span>
            <span className="visually-hidden">Close</span>
          </button>
        </div>
        <figure className={styles.figure}>
          <Image src={src} width={width} height={height} alt={alt} sizes="(max-width: 64rem) 95vw, 60rem" className={styles.img} />
          <figcaption className={styles.caption}>
            {caption && <span>{caption}</span>}
            <a href={src} target="_blank" rel="noopener">
              Open full-size image<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </figcaption>
        </figure>
      </dialog>
    </>
  );
}
