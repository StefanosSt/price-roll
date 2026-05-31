/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

/**
 * Reusable campaigns table. Used on the home page (recent campaigns) and the
 * Campaigns tab (all campaigns). Includes an inline status filter and per-row
 * edit / replay actions that navigate to the campaign edit route.
 *
 * Pass `pageSize` to enable the table's built-in pagination (used on the
 * Campaigns tab); omit it to render every matching row (used on the home page).
 */
export function CampaignsTable({ campaigns, pageSize }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      campaigns.filter(
        (campaign) =>
          status === "all" || campaign.status.toLowerCase() === status,
      ),
    [campaigns, status],
  );

  const paginated = Boolean(pageSize);
  const totalPages = paginated
    ? Math.max(1, Math.ceil(filtered.length / pageSize))
    : 1;
  // Clamp in case the active page no longer exists after filtering.
  const safePage = Math.min(page, totalPages);
  const rows = paginated
    ? filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
    : filtered;

  // Reset to the first page whenever the status filter changes, otherwise the
  // current page could fall outside the newly filtered result set.
  const handleStatusChange = (event) => {
    setStatus(event.currentTarget.value);
    setPage(1);
  };

  const goPrevious = () => setPage((current) => Math.max(1, current - 1));
  const goNext = () => setPage((current) => Math.min(totalPages, current + 1));

  // Wire up <s-table>'s built-in pagination only when a page size is provided.
  // Boolean attributes are spread in conditionally so that, on React 18, a
  // `false` value is never rendered as a (truthy) string attribute.
  const paginationProps = paginated
    ? {
        paginate: true,
        ...(safePage > 1 ? { hasPreviousPage: true } : {}),
        ...(safePage < totalPages ? { hasNextPage: true } : {}),
        onPreviousPage: goPrevious,
        onNextPage: goNext,
        paginationLabel: `Page ${safePage} of ${totalPages}`,
      }
    : {};

  return (
    <s-table {...paginationProps}>
      <s-select
        slot="filters"
        label="Status"
        labelAccessibilityVisibility="exclusive"
        name="status"
        value={status}
        onChange={handleStatusChange}
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
