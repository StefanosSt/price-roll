/* eslint-disable react/prop-types */
import {
  CONDITION_ATTRIBUTES,
  attributeMeta,
  operatorsFor,
  readValue,
  readChoice,
} from "../../lib/campaign";
import { CONDITION_SOURCES, PRODUCT_STATUSES } from "../../data/catalog";
import { SearchableValue } from "./SearchableValue";

/**
 * Renders the value editor for a single condition, switching on the attribute's
 * declared `editor` (and, for dates, the chosen operator). Mirrors the Sale
 * Discount Wizard: searchable type/vendor, tag picker with OR/AND, status
 * select, "in the last N days" for dates, and a plain text title match.
 */
function ConditionValue({ condition, onUpdate }) {
  const meta = attributeMeta(condition.attribute);
  const set = (field, value) => onUpdate(condition.id, field, value);

  switch (meta.editor) {
    case "search":
      return (
        <SearchableValue
          options={CONDITION_SOURCES[meta.source] ?? []}
          selected={condition.value}
          onChange={(value) => set("value", value)}
        />
      );

    case "tags":
      return (
        <s-stack direction="block" gap="small">
          <s-choice-list
            label="Tag match"
            labelAccessibilityVisibility="exclusive"
            name={`tagMode-${condition.id}`}
            onChange={(e) => set("tagMode", readChoice(e))}
          >
            <s-choice value="any" selected={condition.tagMode === "any" || undefined}>
              any tag (OR)
            </s-choice>
            <s-choice value="all" selected={condition.tagMode === "all" || undefined}>
              all tags (AND)
            </s-choice>
          </s-choice-list>
          <SearchableValue
            options={CONDITION_SOURCES.tags}
            multiple
            selected={condition.values}
            onChange={(values) => set("values", values)}
          />
        </s-stack>
      );

    case "select":
      return (
        <s-select
          label="Value"
          labelAccessibilityVisibility="exclusive"
          value={condition.value}
          onChange={(e) => set("value", readValue(e))}
        >
          <s-option value="">Select…</s-option>
          {PRODUCT_STATUSES.map((status) => (
            <s-option key={status.value} value={status.value}>
              {status.label}
            </s-option>
          ))}
        </s-select>
      );

    case "date":
      return condition.operator === "in-the-last" ? (
        <s-number-field
          label="Days"
          labelAccessibilityVisibility="exclusive"
          suffix="days"
          inputMode="numeric"
          min={0}
          value={condition.value}
          onInput={(e) => set("value", readValue(e))}
        ></s-number-field>
      ) : (
        <s-date-field
          label="Date"
          labelAccessibilityVisibility="exclusive"
          value={condition.value}
          onChange={(e) => set("value", readValue(e))}
        ></s-date-field>
      );

    case "text":
    default:
      return (
        <s-text-field
          label="Value"
          labelAccessibilityVisibility="exclusive"
          placeholder="Enter a value"
          value={condition.value}
          onInput={(e) => set("value", readValue(e))}
        ></s-text-field>
      );
  }
}

/**
 * The "Products matching … of these conditions" builder. Each condition is a card
 * with attribute → operator → value-editor → remove. Purely controlled: all
 * state lives in the campaign form hook.
 */
export function ConditionBuilder({
  conditionMode,
  conditions,
  onModeChange,
  onAdd,
  onRemove,
  onUpdate,
}) {
  const removable = conditions.length > 1;

  return (
    <s-stack direction="block" gap="base">
      <s-choice-list
        label="Products must match"
        name="conditionMode"
        onChange={(e) => onModeChange(readChoice(e))}
      >
        <s-choice value="all" selected={conditionMode === "all" || undefined}>
          all conditions
        </s-choice>
        <s-choice value="any" selected={conditionMode === "any" || undefined}>
          any condition
        </s-choice>
      </s-choice-list>

      {conditions.map((condition) => (
        <s-grid
          key={condition.id}
          gridTemplateColumns={removable ? "1fr 1fr 1.5fr auto" : "1fr 1fr 1.5fr"}
          gap="small"
          alignItems="start"
        >
          <s-select
            label="Attribute"
            labelAccessibilityVisibility="exclusive"
            value={condition.attribute}
            onChange={(e) => onUpdate(condition.id, "attribute", readValue(e))}
          >
            {CONDITION_ATTRIBUTES.map((attr) => (
              <s-option key={attr.value} value={attr.value}>
                {attr.label}
              </s-option>
            ))}
          </s-select>

          <s-select
            label="Operator"
            labelAccessibilityVisibility="exclusive"
            value={condition.operator}
            onChange={(e) => onUpdate(condition.id, "operator", readValue(e))}
          >
            {operatorsFor(condition.attribute).map((op) => (
              <s-option key={op.value} value={op.value}>
                {op.label}
              </s-option>
            ))}
          </s-select>

          <ConditionValue condition={condition} onUpdate={onUpdate} />

          {removable && (
            <s-button
              variant="tertiary"
              tone="neutral"
              icon="delete"
              accessibilityLabel="Remove condition"
              onClick={() => onRemove(condition.id)}
            ></s-button>
          )}
        </s-grid>
      ))}

      <s-stack direction="inline" gap="base">
        <s-button variant="tertiary" icon="plus" onClick={onAdd}>
          Add another condition
        </s-button>
      </s-stack>
    </s-stack>
  );
}
