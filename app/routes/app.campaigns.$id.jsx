import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { campaigns } from "../data/campaigns";
import { CampaignPage } from "../components/campaign/CampaignPage";

export const loader = async ({ request, params }) => {
  await authenticate.admin(request);

  // Dummy lookup for now — swap for a DB query keyed on the shop + id later.
  const found = campaigns.find((c) => String(c.id) === params.id);

  // Map the list record onto the subset of form fields we currently have data
  // for. The hook fills in the rest from `createEmptyCampaign`.
  const initialCampaign = found ? { title: found.name } : {};

  return { initialCampaign };
};

export default function EditCampaign() {
  const { initialCampaign } = useLoaderData();
  return <CampaignPage mode="edit" initialCampaign={initialCampaign} />;
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
