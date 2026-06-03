/* eslint-disable react/prop-types */
import {
  DISCOUNT_TYPES,
  DEACTIVATION_OPTIONS,
  readValue,
  readChoice,
} from "../../lib/campaign";
import { TargetingSection } from "./TargetingSection";

/**
 * The editable left column of the campaign editor. Stateless: every value and
 * handler comes from the `form` object returned by `useCampaignForm`, so this
 * same component powers both the New and Edit routes.
 */
export function CampaignForm({ form }) {
  const { campaign, update, toggle } = form;
  const { discountType } = campaign;

  return (
    <>
      {/* ── Title ──────────────────────────────────────────────────── */}
      <s-section heading="Title">
        <s-text-field
          label="Campaign title"
          labelAccessibilityVisibility="exclusive"
          name="title"
          placeholder="e.g. Summer Sale 2026"
          details="Only for staff use — not visible to customers."
          value={campaign.title}
          onInput={(e) => update("title", readValue(e))}
        ></s-text-field>
      </s-section>

      {/* ── Which products ─────────────────────────────────────────── */}
      <TargetingSection form={form} />

      {/* ── Discount value (mirrors the wizard's Pricing section) ───── */}
      <s-section heading="Discount value">
        <s-stack direction="block" gap="base">
          <s-choice-list
            label="Discount type"
            labelAccessibilityVisibility="exclusive"
            name="discountType"
            onChange={(e) => update("discountType", readChoice(e))}
          >
            {DISCOUNT_TYPES.map((type) => (
              <s-choice
                key={type.value}
                value={type.value}
                selected={discountType === type.value || undefined}
              >
                {type.label}
              </s-choice>
            ))}
          </s-choice-list>

          {discountType === "percentage" && (
            <s-stack direction="block" gap="base">
              <s-number-field
                label="Percentage"
                labelAccessibilityVisibility="exclusive"
                name="percentageValue"
                suffix="%"
                details="from full price amount"
                inputMode="decimal"
                min={0}
                max={100}
                value={campaign.percentageValue}
                onInput={(e) => update("percentageValue", readValue(e))}
              ></s-number-field>
              <s-stack direction="inline" gap="large">
                <s-switch
                  label="Round to nearest decimals"
                  name="roundNearestDecimals"
                  checked={campaign.roundNearestDecimals || undefined}
                  onChange={() => toggle("roundNearestDecimals")}
                ></s-switch>
                <s-switch
                  label="Round to last decimal"
                  name="roundLastDecimal"
                  checked={campaign.roundLastDecimal || undefined}
                  onChange={() => toggle("roundLastDecimal")}
                ></s-switch>
              </s-stack>
            </s-stack>
          )}

          {discountType === "amount" && (
            <s-money-field
              label="Amount"
              labelAccessibilityVisibility="exclusive"
              name="amountValue"
              details="Subtract this amount from current price"
              min={0}
              value={campaign.amountValue}
              onInput={(e) => update("amountValue", readValue(e))}
            ></s-money-field>
          )}

          {discountType === "fixed" && (
            <s-money-field
              label="Fixed sale price"
              labelAccessibilityVisibility="exclusive"
              name="fixedPriceValue"
              details="Set price to this amount (needs to be lower than regular price)"
              min={0}
              value={campaign.fixedPriceValue}
              onInput={(e) => update("fixedPriceValue", readValue(e))}
            ></s-money-field>
          )}

          <s-paragraph>
            Compare-at price will be set to the original product price.
          </s-paragraph>
        </s-stack>
      </s-section>

      {/* ── Scheduling ─────────────────────────────────────────────── */}
      <s-section heading="Scheduling (optional)">
        <s-stack direction="block" gap="base">
          <s-stack direction="block" gap="small">
            <s-checkbox
              label="Activate at a specific time"
              name="activateAtTime"
              details="If unchecked, the sale starts immediately upon saving."
              checked={campaign.activateAtTime || undefined}
              onChange={() => toggle("activateAtTime")}
            ></s-checkbox>
            {campaign.activateAtTime && (
              <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                <s-date-field
                  label="Start date"
                  name="startDate"
                  value={campaign.startDate}
                  onChange={(e) => update("startDate", readValue(e))}
                ></s-date-field>
                <s-text-field
                  label="Start time"
                  name="startTime"
                  placeholder="HH:MM"
                  value={campaign.startTime}
                  onInput={(e) => update("startTime", readValue(e))}
                ></s-text-field>
              </s-grid>
            )}
          </s-stack>

          <s-stack direction="block" gap="small">
            <s-checkbox
              label="Deactivate automatically"
              name="deactivateAuto"
              checked={campaign.deactivateAuto || undefined}
              onChange={() => toggle("deactivateAuto")}
            ></s-checkbox>
            {campaign.deactivateAuto && (
              <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                <s-date-field
                  label="End date"
                  name="endDate"
                  value={campaign.endDate}
                  onChange={(e) => update("endDate", readValue(e))}
                ></s-date-field>
                <s-text-field
                  label="End time"
                  name="endTime"
                  placeholder="HH:MM"
                  value={campaign.endTime}
                  onInput={(e) => update("endTime", readValue(e))}
                ></s-text-field>
              </s-grid>
            )}
          </s-stack>
        </s-stack>
      </s-section>

      {/* ── Activation ─────────────────────────────────────────────── */}
      <s-section heading="Activation">
        <s-checkbox
          label="Allow this sale to override other Price Roll discounts"
          name="overrideOtherSales"
          details="By default, Price Roll skips products already discounted by another active sale."
          checked={campaign.overrideOtherSales || undefined}
          onChange={() => toggle("overrideOtherSales")}
        ></s-checkbox>
      </s-section>

      {/* ── Deactivation ───────────────────────────────────────────── */}
      <s-section heading="Deactivation">
        <s-choice-list
          label="When this sale ends"
          labelAccessibilityVisibility="exclusive"
          name="deactivationMode"
          onChange={(e) => update("deactivationMode", readChoice(e))}
        >
          {DEACTIVATION_OPTIONS.map((option) => (
            <s-choice
              key={option.value}
              value={option.value}
              selected={campaign.deactivationMode === option.value || undefined}
            >
              {option.label}
              <s-text slot="details">{option.help}</s-text>
            </s-choice>
          ))}
        </s-choice-list>
      </s-section>

      {/* ── Product tags ───────────────────────────────────────────── */}
      <s-section heading="Product tags">
        <s-stack direction="block" gap="base">
          <s-text-field
            label="Tags to add during sale (removed when it ends)"
            name="tagsToAdd"
            placeholder="e.g. on-sale, promo"
            value={campaign.tagsToAdd}
            onInput={(e) => update("tagsToAdd", readValue(e))}
          ></s-text-field>
          <s-text-field
            label="Tags to remove during sale (restored when it ends)"
            name="tagsToRemove"
            placeholder="e.g. full-price"
            value={campaign.tagsToRemove}
            onInput={(e) => update("tagsToRemove", readValue(e))}
          ></s-text-field>
        </s-stack>
      </s-section>
    </>
  );
}
