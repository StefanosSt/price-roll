/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCampaignForm } from "../../hooks/useCampaignForm";
import { CampaignForm } from "./CampaignForm";
import { CampaignSummary } from "./CampaignSummary";

const SAVE_BAR_ID = "campaign-save-bar";

/**
 * Shared shell for the campaign editor, used by both the New and Edit routes.
 * Lays out the Details template: an editable form in the primary column and the
 * live summary in the `aside` slot (only visible at `inlineSize="base"`).
 *
 * Save/Discard live in Shopify's contextual Save Bar at the top (shown while the
 * form is dirty), plus a Save button pinned bottom-right like the discounts page.
 *
 * @param {object} props
 * @param {"new"|"edit"} props.mode
 * @param {object} [props.initialCampaign] Seed values for the edit route.
 */
export function CampaignPage({ mode, initialCampaign }) {
  const shopify = useAppBridge();
  const form = useCampaignForm(initialCampaign);

  const heading = mode === "edit" ? "Edit campaign" : "Create campaign";

  // Mirror the dirty state into the contextual Save Bar.
  useEffect(() => {
    if (form.dirty) shopify.saveBar.show(SAVE_BAR_ID);
    else shopify.saveBar.hide(SAVE_BAR_ID);
  }, [form.dirty, shopify]);

  const handleSave = () => {
    // TODO: persist to the backend, then clear the dirty state.
    form.markSaved();
  };

  const handleDiscard = () => {
    form.reset();
  };

  return (
    <s-page heading={heading} inlineSize="base">
      <s-link slot="breadcrumb-actions" href="/app/campaigns">
        Campaigns
      </s-link>

      {/* Contextual save bar — appears at the top when there are changes. */}
      <ui-save-bar id={SAVE_BAR_ID}>
        <button variant="primary" onClick={handleSave}>
          Save
        </button>
        <button onClick={handleDiscard}>Discard</button>
      </ui-save-bar>

      <CampaignForm form={form} />

      {/* Bottom-right Save, like the Shopify discounts editor. */}
      <s-stack direction="inline" justifyContent="end">
        <s-button
          variant="primary"
          disabled={!form.dirty || undefined}
          onClick={handleSave}
        >
          Save
        </s-button>
      </s-stack>

      <CampaignSummary summary={form.summary} />
    </s-page>
  );
}
