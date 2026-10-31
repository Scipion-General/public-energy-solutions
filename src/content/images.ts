/**
 * Image assets (files live in public/images/). Alt texts are content, kept here
 * with the rest of the copy.
 */
export const images = {
  /** pes.png, trimmed of its transparent margin (public/images/pes-mark.png). */
  logoMark: { src: "/images/pes-mark.png", width: 450, height: 360, alt: "" },
  /** pes_full_logo.png, trimmed (public/images/pes-full-logo-trimmed.png). */
  logoFull: {
    src: "/images/pes-full-logo-trimmed.png",
    width: 871,
    height: 497,
    alt: "Public Energy Solutions logo",
  },
  gasHubsMap: {
    src: "/images/european_gas_hubs2.png",
    width: 1906,
    height: 1580,
    alt:
      "Map of Europe showing the gas virtual trading point of each market: Ireland IBP, United Kingdom NBP, " +
      "Netherlands TTF (highlighted), Belgium/Luxembourg ZTP, France PEG, Denmark ETF, Germany THE, Poland VTP-GAZ, " +
      "Czech Republic OTE, Austria CEGH VTP, Hungary MGP, Italy PSV, Spain PVB, Portugal VIP-Iberico and Greece HTP.",
  },
} as const;
