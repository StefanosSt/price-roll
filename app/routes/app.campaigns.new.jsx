import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { CampaignPage } from "../components/campaign/CampaignPage";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function NewCampaign() {
  return <CampaignPage mode="new" />;
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
