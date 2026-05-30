import { useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { CampaignForm } from "../components/CampaignForm";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function NewCampaign() {
  const navigate = useNavigate();

  return (
    <s-page heading="Create campaign">
      <s-button slot="primary-action" variant="primary">
        Save
      </s-button>
      <s-button slot="secondary-actions" onClick={() => navigate("/app/campaigns")}>
        Discard
      </s-button>

      <CampaignForm />
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
