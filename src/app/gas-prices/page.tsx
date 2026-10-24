import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PriceExplorer } from "@/components/prices/PriceExplorer";

export const metadata: Metadata = {
  title: "Gas Prices",
  description: "Wholesale gas prices from the PES price data file, shown as a table and chart.",
};

export default function GasPricesPage() {
  return (
    <>
      <PageHeader title="Gas prices">
        <p>Wholesale gas prices in EUR/MWh, as published in our price data file. Each figure shows its source.</p>
      </PageHeader>
      <div className="container section">
        <PriceExplorer />
        <p style={{ fontSize: "0.9rem", color: "var(--gray-600)", marginTop: "2rem" }}>
          Figures are shown for information only and are not an offer, forecast or advice. Check the stated source
          for the authoritative value.
        </p>
      </div>
    </>
  );
}
