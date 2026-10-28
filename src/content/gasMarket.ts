/**
 * Educational content for the European Gas Market page.
 * Every section cites primary/official sources. Review periodically:
 * regulation in this area changes frequently.
 */
export const GAS_MARKET_LAST_REVIEWED = "2026-10-24";

export interface Source {
  label: string;
  url: string;
}

export interface Section {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
  sources: Source[];
}

export const gasMarketSections: Section[] = [
  {
    id: "structure",
    title: "How the market is organised",
    paragraphs: [
      "The liberalisation of the European gas market began in the early 2000s, opening the market to competition and establishing a framework in which gas production and supply are separated from the operation of transmission networks.",
      "Transmission System Operators (TSOs) operate these networks independently of the commercial interests of producers and suppliers. Companies acting as shippers can book capacity and transport gas through the network under transparent, objective and non-discriminatory third-party access rules.",
      "These principles were formalised in the 2009 Gas Directive. In 2024, the EU adopted a revised framework covering natural gas, renewable and low-carbon gases, and hydrogen. While the regulatory framework continues to evolve, the fundamental principles underpinning the natural gas market remain largely unchanged.",
      "At European level, TSOs cooperate through the European Network of Transmission System Operators for Gas (ENTSOG), while the Agency for the Cooperation of Energy Regulators (ACER) works with national regulatory authorities to support market integration, regulatory coordination and the effective functioning of the European gas market."
    ],
    sources: [
      { label: "Directive (EU) 2024/1788 – common rules for the internal markets for renewable gas, natural gas and hydrogen (EUR-Lex)", url: "https://eur-lex.europa.eu/eli/dir/2024/1788/oj" },
      { label: "Directive 2009/73/EC – Third Energy Package gas directive (EUR-Lex)", url: "https://eur-lex.europa.eu/eli/dir/2009/73/oj" },
      { label: "ACER – EU Agency for the Cooperation of Energy Regulators", url: "https://www.acer.europa.eu/" },
      { label: "ENTSOG - The European Network of Transmission System Operators for Gas", url: "https://www.entsog.eu/" },
    ],
  },
  {
    id: "hubs",
    title: "Trading hubs and price benchmarks",
    paragraphs: [
      "European gas is traded at virtual trading points (VTP or hubs), each covering an entry-exit zone. Prices for physical delivery on the next day, month, quarter or year are formed between counterparties.",
      "The Dutch Title Transfer Facility (TTF) is the most liquid hub in continental Europe and is widely used as the reference price for European gas.",
    ],
    list: [
      "TTF (Title Transfer Facility) - Netherlands",
      "THE (Trading Hub Europe) - Germany",
      "PEG (Point d'Échange de Gaz) - France",
      "CEGH (Central European Gas Hub) - Austria",
      "PSV (Punto di Scambio Virtuale) - Italy",
      "PVB (Punto Virtual de Balance) - Spain",
      "ZTP (Zeebrugge Trading Point) - Belgium",
      "NBP (National Balancing Point) - Great Britain (outside the EU)",
    ],
    sources: [
      { label: "ENTSOG - The European Network of Transmission System Operators for Gas", url: "https://www.entsog.eu/" },
    ],
  },
  {
    id: "supply",
    title: "Where Europe's gas comes from",
    paragraphs: [
      "The EU produces only a small share of the gas it consumes, relying on imports via pipelines from countries like Norway and Algeria, as well as liquefied natural gas (LNG) shipped from the United States, Canada and Qatar.",
      "Following Russia’s invasion of Ukraine in 2022, Russian pipeline deliveries fell sharply, and LNG became a much bigger part of the EU’s gas supply. These geopolitical tensions also sped up construction of the Wilhelmshaven LNG terminal in northern Germany.",
    ],
    sources: [
      { label: "Eurostat – natural gas supply statistics", url: "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Natural_gas_supply_statistics" },
    ],
  },
  {
    id: "storage",
    title: "Storage and security of supply",
    paragraphs: [
      "Underground storage helps balance seasonal demand: gas is typically injected during the summer gas season (April to September) and withdrawn during the winter gas season (October to March). European regulations set filling obligations for some EU storage facilities ahead of each winter, with stricter requirements in some countries than in others. The rules are flexible, allowing EU Member States to introduce specific incentives to meet their filling targets.",
      "Storage filling levels are published daily on the Aggregated Gas Storage Inventory (AGSI) platform, run by Gas Infrastructure Europe.",
    ],
    sources: [
      { label: "GIE AGSI – gas storage transparency platform", url: "https://agsi.gie.eu/" },
    ],
  },
  {
    id: "crisis-measures",
    title: "What changed since 2022",
    paragraphs: [
      "In response to the 2022 energy price crisis, the EU adopted temporary emergency measures, including restrictions on Russian gas imports. This triggered a major shift in supply towards LNG, bringing the European TTF benchmark more closely in line with the Asian JKM benchmark. The sudden disruption of Russian gas flows also contributed to a gradual decoupling of gas and electricity prices.",
    ],
    sources: [
      { label: "Regulation (EU) 2023/706 – on coordinated demand-reduction measures for gas", url: "https://eur-lex.europa.eu/eli/reg/2022/1369/2023-04-01" },
    ],
  }
];
