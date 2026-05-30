import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

const pastCampaigns = [
  {
    id: 1,
    name: "Clearance Jan 2024",
    detail: "6 collections · 398 products · avg. 22% off · Jan 20 – Feb 20, 2024",
  },
  {
    id: 2,
    name: "Black Friday 2024",
    detail:
      "12 collections · 1,240 products · avg. 40% off · Nov 29 – Dec 2, 2024",
  },
  {
    id: 3,
    name: "Summer Promo 2023",
    detail: "3 collections · 210 products · avg. 18% off · Jun 1 – Jun 30, 2023",
  },
];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Replay() {
  return (
    <s-page heading="Replay">
      <s-section>
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Select a past campaign to replay with the same discount rules,
            remapped to new dates.
          </s-paragraph>

          {pastCampaigns.map((campaign) => (
            <s-box
              key={campaign.id}
              padding="base"
              background="subdued"
              borderRadius="base"
            >
              <s-stack
                direction="inline"
                gap="base"
                alignItems="center"
                justifyContent="space-between"
              >
                <s-stack direction="inline" gap="base" alignItems="center">
                  <s-box padding="small" background="base" borderRadius="base">
                    <s-icon type="calendar"></s-icon>
                  </s-box>
                  <s-stack direction="block" gap="small-200">
                    <s-heading>{campaign.name}</s-heading>
                    <s-text color="subdued">{campaign.detail}</s-text>
                  </s-stack>
                </s-stack>
                <s-button variant="secondary" icon="arrow-right">
                  Replay
                </s-button>
              </s-stack>
            </s-box>
          ))}

          <s-banner tone="info">
            Replaying a campaign creates a new draft pre-filled with the same
            collection rules and discounts. You can edit any rule before
            scheduling.
          </s-banner>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
