import { useMemo, useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

// Filter option sources (dummy — replace with loader data later).
const COLLECTIONS = [
  "Outerwear",
  "Shoes & Boots",
  "Summer Collection",
  "Accessories",
];

const CAMPAIGNS = ["Winter Sale 2025", "Black Friday 2024", "Clearance Jan 2024"];

// Price-change rows, most recent first.
const PRICE_CHANGES = [
  {
    id: 1,
    product: "Wool Coat – Navy / M",
    collection: "Outerwear",
    campaign: "Winter Sale 2025",
    original: "€149.00",
    sale: "€96.85",
    discount: "35%",
    changedAt: "Jan 20, 09:00",
  },
  {
    id: 2,
    product: "Chelsea Boot – Black / 42",
    collection: "Shoes & Boots",
    campaign: "Winter Sale 2025",
    original: "€119.00",
    sale: "€83.30",
    discount: "30%",
    changedAt: "Jan 20, 09:00",
  },
  {
    id: 3,
    product: "Linen Dress – White / S",
    collection: "Summer Collection",
    campaign: "Winter Sale 2025",
    original: "€89.00",
    sale: "€66.75",
    discount: "25%",
    changedAt: "Jan 20, 09:00",
  },
  {
    id: 4,
    product: "Leather Belt – Brown",
    collection: "Accessories",
    campaign: "Winter Sale 2025",
    original: "€45.00",
    sale: "€38.25",
    discount: "15%",
    changedAt: "Jan 20, 09:00",
  },
  {
    id: 5,
    product: "Puffer Jacket – Red / L",
    collection: "Outerwear",
    campaign: "Black Friday 2024",
    original: "€199.00",
    sale: "€99.50",
    discount: "50%",
    changedAt: "Nov 29, 00:00",
  },
  {
    id: 6,
    product: "Wool Coat – Navy / M",
    collection: "Outerwear",
    campaign: "Clearance Jan 2024",
    original: "€149.00",
    sale: "€96.85",
    discount: "35%",
    changedAt: "Jan 20, 09:00",
  },
];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function PriceHistory() {
  const [tab, setTab] = useState("history");

  return (
    <s-page heading="Price History">
      <s-stack direction="inline" gap="small-200">
        <s-button
          variant={tab === "history" ? "primary" : "tertiary"}
          onClick={() => setTab("history")}
        >
          History
        </s-button>
        <s-button
          variant={tab === "theme-block" ? "primary" : "tertiary"}
          onClick={() => setTab("theme-block")}
        >
          Theme Block
        </s-button>
      </s-stack>

      {tab === "history" ? <HistoryTab /> : <ThemeBlockTab />}
    </s-page>
  );
}

function HistoryTab() {
  const [collections, setCollections] = useState([]);
  const [campaign, setCampaign] = useState("all");
  const [period, setPeriod] = useState("90");

  // Normalize the multi-select choice-list value (array or comma string).
  const handleCollectionsChange = (event) => {
    const value = event.currentTarget.value;
    const next = Array.isArray(value)
      ? value
      : value
        ? String(value).split(",").filter(Boolean)
        : [];
    setCollections(next);
  };

  const rows = useMemo(
    () =>
      PRICE_CHANGES.filter(
        (row) =>
          (collections.length === 0 ||
            collections.includes(row.collection)) &&
          (campaign === "all" || row.campaign === campaign),
      ),
    [collections, campaign],
  );

  const collectionsLabel =
    collections.length > 0 ? `Collections (${collections.length})` : "Collections";

  return (
    <s-section padding="none">
      <s-table>
        <s-stack slot="filters" direction="inline" gap="small" alignItems="end">
          <s-button icon="collection" commandFor="collections-popover">
            {collectionsLabel}
          </s-button>
          <s-popover id="collections-popover" inlineSize="250px">
            <s-box padding="base">
              <s-choice-list
                label="Collections"
                name="collections"
                multiple
                onChange={handleCollectionsChange}
              >
                {COLLECTIONS.map((name) => (
                  <s-choice key={name} value={name}>
                    {name}
                  </s-choice>
                ))}
              </s-choice-list>
            </s-box>
          </s-popover>

          <s-select
            label="Campaign"
            labelAccessibilityVisibility="exclusive"
            name="campaign"
            value={campaign}
            onChange={(event) => setCampaign(event.currentTarget.value)}
          >
            <s-option value="all">All campaigns</s-option>
            {CAMPAIGNS.map((name) => (
              <s-option key={name} value={name}>
                {name}
              </s-option>
            ))}
          </s-select>

          <s-select
            label="Period"
            labelAccessibilityVisibility="exclusive"
            name="period"
            value={period}
            onChange={(event) => setPeriod(event.currentTarget.value)}
          >
            <s-option value="30">Last 30 days</s-option>
            <s-option value="90">Last 90 days</s-option>
            <s-option value="365">Last 12 months</s-option>
            <s-option value="all">All time</s-option>
          </s-select>
        </s-stack>

        <s-table-header-row>
          <s-table-header listSlot="primary">Product</s-table-header>
          <s-table-header>Campaign</s-table-header>
          <s-table-header>Original</s-table-header>
          <s-table-header>Sale price</s-table-header>
          <s-table-header>Discount</s-table-header>
          <s-table-header>Changed at</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {rows.map((row) => (
            <s-table-row key={row.id}>
              <s-table-cell>
                <s-stack direction="block" gap="small-300">
                  <s-text type="strong">{row.product}</s-text>
                  <s-badge tone="neutral">{row.collection}</s-badge>
                </s-stack>
              </s-table-cell>
              <s-table-cell>{row.campaign}</s-table-cell>
              <s-table-cell>{row.original}</s-table-cell>
              <s-table-cell>
                <s-text tone="success">{row.sale}</s-text>
              </s-table-cell>
              <s-table-cell>{row.discount}</s-table-cell>
              <s-table-cell>{row.changedAt}</s-table-cell>
            </s-table-row>
          ))}
        </s-table-body>
      </s-table>

      {rows.length === 0 && (
        <s-box padding="large">
          <s-stack direction="block" gap="small" alignItems="center">
            <s-text color="subdued">
              No price changes match your filters.
            </s-text>
          </s-stack>
        </s-box>
      )}
    </s-section>
  );
}

function ThemeBlockTab() {
  return (
    <s-section heading="Theme Block">
      <s-paragraph>
        The theme block configuration will be added here later.
      </s-paragraph>
    </s-section>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
