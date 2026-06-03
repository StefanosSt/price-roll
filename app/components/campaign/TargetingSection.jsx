/* eslint-disable react/prop-types */
import { TARGET_MODES, SCOPE_OPTIONS, readChoice } from "../../lib/campaign";
import { ConditionBuilder } from "./ConditionBuilder";
import { ResourcePickerField } from "./ResourcePickerField";

/**
 * The "Which products?" section of the campaign editor. Targeting is two
 * mutually-exclusive modes:
 *
 *  • "rules"    — a dynamic query: all products OR specific collections, optionally
 *                 refined by conditions (type / tag / vendor). Catches future matches.
 *  • "products" — a static, hand-picked set of products/variants. Conditions are
 *                 intentionally hidden here: the merchant already enumerated everything.
 *
 * The condition builder is only mounted in rules mode, so the "no conditions on
 * explicit products" rule is enforced structurally — no hidden state to clear.
 *
 * Stateless: every value and handler comes from the `form` object returned by
 * `useCampaignForm`, the same instance the summary sidebar reads from.
 */
export function TargetingSection({ form }) {
  const {
    campaign,
    update,
    toggle,
    addCondition,
    removeCondition,
    updateCondition,
  } = form;
  const { targetMode, scope } = campaign;

  return (
    <s-section heading="Which products?">
      <s-stack direction="block" gap="large">
        {/* ── Targeting method ─────────────────────────────────────── */}
        <s-choice-list
          label="Targeting method"
          name="targetMode"
          onChange={(e) => update("targetMode", readChoice(e))}
        >
          {TARGET_MODES.map((mode) => (
            <s-choice
              key={mode.value}
              value={mode.value}
              selected={targetMode === mode.value || undefined}
            >
              {mode.label}
            </s-choice>
          ))}
        </s-choice-list>

        {/* ── Rules mode: scope + optional conditions ──────────────── */}
        {targetMode === "rules" && (
          <s-stack direction="block" gap="large">
            <s-choice-list
              label="Apply to"
              name="scope"
              onChange={(e) => update("scope", readChoice(e))}
            >
              {SCOPE_OPTIONS.map((option) => (
                <s-choice
                  key={option.value}
                  value={option.value}
                  selected={scope === option.value || undefined}
                >
                  {option.label}
                </s-choice>
              ))}
            </s-choice-list>

            {scope === "collections" && (
              <s-stack direction="block" gap="small">
                <s-heading>Collections</s-heading>
                <ResourcePickerField
                  type="collection"
                  buttonText="Add collections"
                  selected={campaign.collections}
                  onChange={(resources) => update("collections", resources)}
                />
              </s-stack>
            )}

            <s-stack direction="block" gap="small">
              <s-heading>Match by condition (optional)</s-heading>
              <s-paragraph>
                Refine the selection above with rules like tags or vendor. If no
                collections are selected, these conditions apply to your entire
                store catalog.
              </s-paragraph>
              <ConditionBuilder
                conditionMode={campaign.conditionMode}
                conditions={campaign.conditions}
                onModeChange={(value) => update("conditionMode", value)}
                onAdd={addCondition}
                onRemove={removeCondition}
                onUpdate={updateCondition}
              />
            </s-stack>
          </s-stack>
        )}

        {/* ── Products mode: explicit picks, no conditions ─────────── */}
        {targetMode === "products" && (
          <s-stack direction="block" gap="small">
            <s-heading>Products / variants</s-heading>
            <ResourcePickerField
              type="product"
              buttonText="Add products / variants"
              selected={campaign.products}
              onChange={(resources) => update("products", resources)}
            />
          </s-stack>
        )}

        <s-divider></s-divider>

        {/* ── Exclusions (shared by both modes) ────────────────────── */}
        <s-stack direction="block" gap="base">
          <s-heading>Which products to exclude?</s-heading>
          <s-paragraph>
            Products with type &quot;Gift Card&quot; are automatically excluded.
          </s-paragraph>
          <s-checkbox
            label="None"
            name="excludeNone"
            checked={campaign.excludeNone || undefined}
            onChange={() => toggle("excludeNone")}
          ></s-checkbox>

          {!campaign.excludeNone && (
            <ResourcePickerField
              type="product"
              buttonText="Add products / variants to exclude"
              selected={campaign.excludedProducts}
              onChange={(resources) => update("excludedProducts", resources)}
            />
          )}
        </s-stack>
      </s-stack>
    </s-section>
  );
}
