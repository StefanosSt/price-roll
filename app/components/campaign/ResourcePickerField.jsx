/* eslint-disable react/prop-types */
import { useAppBridge } from "@shopify/app-bridge-react";
import { resourceImage, resourceSubtitle } from "../../lib/campaign";

/**
 * A thin wrapper around Shopify's native Resource Picker — the same "Add
 * products" / "Add collections" modal merchants already know from the admin.
 * Renders the current selection as a compact list with per-row remove buttons
 * plus a button that opens the picker. Purely controlled: the selection lives in
 * the campaign form hook, so this works for include, exclude, collections, etc.
 *
 * @param {object} props
 * @param {"product"|"variant"|"collection"} props.type Resource type to pick.
 * @param {string} props.buttonText Label for the open-picker button.
 * @param {Array}  [props.selected] Currently selected resources.
 * @param {(resources: Array) => void} props.onChange
 * @param {boolean|number} [props.multiple] Allow many (or cap the count).
 */
export function ResourcePickerField({
  type = "product",
  buttonText,
  selected = [],
  onChange,
  multiple = true,
}) {
  const shopify = useAppBridge();

  const openPicker = async () => {
    const picked = await shopify.resourcePicker({
      type,
      multiple,
      action: "select",
      // Pre-select the current choices so the modal opens in an edit state.
      selectionIds: selected.map((resource) => ({ id: resource.id })),
    });
    // `undefined` means the merchant cancelled — keep the existing selection.
    if (picked) onChange(picked);
  };

  const remove = (id) =>
    onChange(selected.filter((resource) => resource.id !== id));

  return (
    <s-stack direction="block" gap="small">
      {selected.map((resource) => {
        const subtitle = resourceSubtitle(resource);
        return (
          <s-box
            key={resource.id}
            padding="small-200"
            border="base"
            borderRadius="base"
          >
            <s-grid
              gridTemplateColumns="auto 1fr auto"
              gap="small"
              alignItems="center"
            >
              <s-thumbnail
                size="small"
                src={resourceImage(resource)}
                alt={resource.title}
              ></s-thumbnail>
              <s-stack direction="block" gap="small-500">
                <s-text>{resource.title}</s-text>
                {subtitle ? <s-text color="subdued">{subtitle}</s-text> : null}
              </s-stack>
              <s-button
                variant="tertiary"
                icon="x"
                accessibilityLabel={`Remove ${resource.title}`}
                onClick={() => remove(resource.id)}
              ></s-button>
            </s-grid>
          </s-box>
        );
      })}

      <s-stack direction="inline">
        <s-button variant="secondary" icon="plus" onClick={openPicker}>
          {buttonText}
        </s-button>
      </s-stack>
    </s-stack>
  );
}
