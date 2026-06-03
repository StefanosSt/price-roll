/* eslint-disable react/prop-types */

/**
 * The read-only summary that lives in the page's `aside` slot — modeled on the
 * Shopify discounts detail sidebar (status badge, type, a bulleted "Details"
 * list, the active dates, and a performance line). It renders entirely from
 * `summary`, the memoized projection produced by `summarizeCampaign`, so it
 * tracks the form live. Status is derived from the schedule — there is no manual
 * active toggle.
 */
export function CampaignSummary({ summary }) {
  return (
    <s-box slot="aside">
      <s-section heading={summary.title}>
        <s-stack direction="block" gap="large">
          <s-stack direction="inline">
            <s-badge tone={summary.status.tone}>{summary.status.label}</s-badge>
          </s-stack>

          <s-stack direction="block" gap="small">
            <s-text type="strong">Type</s-text>
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-icon type="discount"></s-icon>
              <s-text>{summary.headline}</s-text>
            </s-stack>
          </s-stack>

          <s-stack direction="block" gap="small">
            <s-text type="strong">Details</s-text>
            <s-unordered-list>
              {summary.details.map((detail, index) => (
                <s-list-item key={index}>{detail}</s-list-item>
              ))}
            </s-unordered-list>
          </s-stack>

          <s-stack direction="block" gap="small">
            <s-text type="strong">Active dates</s-text>
            <s-grid gridTemplateColumns="auto 1fr" gap="small">
              <s-text color="subdued">Start</s-text>
              <s-text>{summary.schedule.start}</s-text>
              <s-text color="subdued">End</s-text>
              <s-text>{summary.schedule.end}</s-text>
            </s-grid>
          </s-stack>

          <s-stack direction="block" gap="small">
            <s-text type="strong">Performance</s-text>
            <s-text color="subdued">{summary.performance}</s-text>
            <s-link href="/app/price-history">View price history</s-link>
          </s-stack>
        </s-stack>
      </s-section>
    </s-box>
  );
}
