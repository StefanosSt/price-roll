import { useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { campaigns } from "../data/campaigns";
import { CampaignsTable } from "../components/CampaignsTable";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Campaigns() {
  const navigate = useNavigate();
  const hasCampaigns = campaigns.length > 0;

  return (
    <s-page heading="Campaigns">
      <s-button
        slot="primary-action"
        variant="primary"
        icon="plus"
        onClick={() => navigate("/app/campaigns/new")}
      >
        New campaign
      </s-button>

      {hasCampaigns ? (
        <s-section heading="All campaigns" padding="none">
          <CampaignsTable campaigns={campaigns} />
        </s-section>
      ) : (
        <s-section>
          <s-box padding="large">
            <s-stack direction="block" gap="base" alignItems="center">
              <s-heading>Create your first campaign</s-heading>
              <s-paragraph>
                Set up a price campaign to schedule discounts across your
                collections, then track every price change.
              </s-paragraph>
              <s-button
                variant="primary"
                onClick={() => navigate("/app/campaigns/new")}
              >
                Create campaign
              </s-button>
            </s-stack>
          </s-box>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
