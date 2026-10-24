/**
 * Site-wide content. Items marked PLACEHOLDER must be replaced with verified
 * information before going live — do not invent company details.
 */
export const site = {
  name: "Public Energy Solutions",
  shortName: "PES",
  tagline: "Independent energy-market insight for public bodies and mid-size companies",
  contactEmail: "contact@public-energy-solutions.com",
  nav: [
    { href: "/", label: "Home" },
    { href: "/european-gas-market", label: "European Gas Market" },
    { href: "/gas-prices", label: "Gas Prices" },
    { href: "/contact", label: "Contact" },
  ],
  /** PLACEHOLDER: legal entity, registration number, address. */
  legal: null as null | { entity: string; registration: string; address: string },
} as const;

export const home = {
  heroTitle: "Clear guidance through Europe's energy markets",
  heroText:
    "We help public-sector organisations and mid-size companies understand gas markets, " +
    "structure their energy procurement and manage price risk.",
  audiences: [
    {
      title: "Public sector",
      text: "Support for local authorities, hospitals, schools and other public bodies buying energy under public procurement rules.",
    },
    {
      title: "Mid-size companies",
      text: "Practical market insight for businesses whose energy costs matter but who have no in-house trading desk.",
    },
  ],
  /** Service descriptions — PLACEHOLDER wording, to be confirmed by PES. */
  services: [
    { title: "Market briefings", text: "Plain-language explanations of how wholesale gas prices form and what drives them." },
    { title: "Procurement strategy", text: "Help defining purchasing approaches, tender timing and contract structures." },
    { title: "Price-risk awareness", text: "Understanding exposure to market prices and the options available to manage it." },
  ],
};
