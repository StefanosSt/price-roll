import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { campaigns } from "../data/campaigns";
import { CampaignsTable } from "../components/CampaignsTable";

const metrics = [
  { label: "Active campaigns", value: "2", caption: "2 collections each" },
  { label: "Scheduled", value: "3", caption: "Next: Jun 1" },
  { label: "Products on sale", value: "847", caption: "Across 4 collections" },
  { label: "Price changes logged", value: "12,340", caption: "Since Jan 2024" },
];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const recentCampaigns = campaigns.slice(0, 5);

  return (
    <s-page heading="Price Roll">
      <s-section>
        <s-grid
          gridTemplateColumns="@container (inline-size <= 700px) 1fr 1fr, 1fr 1fr 1fr 1fr"
          gap="base"
        >
          {metrics.map((metric) => (
            <s-box
              key={metric.label}
              padding="base"
              background="subdued"
              borderRadius="base"
            >
              <s-stack direction="block" gap="small">
                <s-heading>{metric.label}</s-heading>
                <s-text type="strong">{metric.value}</s-text>
                <s-text color="subdued">{metric.caption}</s-text>
              </s-stack>
            </s-box>
          ))}
        </s-grid>
      </s-section>

      <s-section heading="Recent campaigns" padding="none">
        <CampaignsTable campaigns={recentCampaigns} />
        <s-box padding="base">
          <s-stack direction="inline" justifyContent="end">
            <s-link href="/app/campaigns">View all campaigns</s-link>
          </s-stack>
        </s-box>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
