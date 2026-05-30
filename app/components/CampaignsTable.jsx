/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

/**
 * Reusable campaigns table. Used on the home page (recent campaigns) and the
 * Campaigns tab (all campaigns). Includes an inline status filter and per-row
 * edit / replay actions that navigate to the campaign edit route.
 */
export function CampaignsTable({ campaigns }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () =>
      campaigns.filter(
        (campaign) =>
          status === "all" || campaign.status.toLowerCase() === status,
      ),
    [campaigns, status],
  );

  return (
    <s-table>
      <s-select
        slot="filters"
        label="Status"
        labelAccessibilityVisibility="exclusive"
        name="status"
        value={status}
        onChange={(event) => setStatus(event.currentTarget.value)}
      >
        <s-option value="all">All statuses</s-option>
        <s-option value="active">Active</s-option>
        <s-option value="scheduled">Scheduled</s-option>
        <s-option value="ended">Ended</s-option>
      </s-select>

      <s-table-header-row>
        <s-table-header listSlot="primary">Campaign</s-table-header>
        <s-table-header>Status</s-table-header>
        <s-table-header>Date range</s-table-header>
        <s-table-header format="numeric">Collections</s-table-header>
        <s-table-header format="numeric">Products</s-table-header>
        <s-table-header>Actions</s-table-header>
      </s-table-header-row>
      <s-table-body>
        {rows.map((campaign) => (
          <s-table-row key={campaign.id}>
            <s-table-cell>{campaign.name}</s-table-cell>
            <s-table-cell>
              <s-badge tone={campaign.tone}>{campaign.status}</s-badge>
            </s-table-cell>
            <s-table-cell>{campaign.dateRange}</s-table-cell>
            <s-table-cell>{campaign.collections}</s-table-cell>
            <s-table-cell>{campaign.products}</s-table-cell>
            <s-table-cell>
              <s-stack direction="inline" gap="small-200">
                <s-button
                  variant="secondary"
                  icon="edit"
                  accessibilityLabel={`Edit ${campaign.name}`}
                  onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                ></s-button>
                <s-button
                  variant="secondary"
                  icon="reset"
                  accessibilityLabel={`Replay ${campaign.name}`}
                  onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                ></s-button>
              </s-stack>
            </s-table-cell>
          </s-table-row>
        ))}
      </s-table-body>
    </s-table>
  );
}
