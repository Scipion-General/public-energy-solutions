/**
 * Site-wide content. Items marked PLACEHOLDER must be replaced with verified
 * information before going live — do not invent company details.
 */
export const site = {
  name: "Public Energy Solutions",
  shortName: "PES",
  tagline: "Independent Energy Market Consultancy for Public Bodies and Mid-Sized Companies",
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
    "We help public-sector organisations and mid-size companies understand European gas markets, " +
    "structure their energy procurements and manage their price risk.",
  audiences: [
    {
      title: "Public Sector",
      text: "Support, training and consultancy for local authorities, hospitals, schools and other public-sector organisations navigating energy procurement, wholesale market dynamics and public procurement requirements.",
    },
    {
      title: "Mid-Size Companies",
      text: "Practical commodities-market insight and expert guidance for businesses looking to better understand energy price drivers, navigate market complexity and make more informed purchasing decisions — without the need for an in-house commodities trading team.",
    },
  ],
  /** Service descriptions — PLACEHOLDER wording, to be confirmed by PES. */
  services: [
    { title: "Commodities Market Insight", text: "Comprehensive analysis and clear explanations of wholesale gas price formation, the structure of the European gas market and the key factors shaping market movements. We help clients build a deeper understanding of the market, its underlying mechanisms and the forces influencing energy prices." },
    { title: "Procurement Strategy", text: "Understand the drivers, mechanisms and technicalities behind European gas hubs and energy markets. We help you turn this knowledge into a practical advantage, strengthening your procurement strategy, refining purchasing decisions and developing more effective approaches to sourcing gas and power." },
    { title: "Price-Risk Awareness", text: "Understanding exposure to market prices and the options available to manage it." },
  ],
};
