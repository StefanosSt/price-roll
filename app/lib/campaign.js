/**
 * Campaign domain logic — pure, framework-free helpers shared by the form hook,
 * the form UI, and the summary sidebar. Keeping this layer free of React makes
 * the option lists and the `summarizeCampaign` projection trivially testable and
 * reusable (e.g. later by a loader/action that persists to the database).
 */

// ── Option catalogs ────────────────────────────────────────────────────────

// Pricing modes, mirroring the Sale Discount Wizard's "Pricing" section.
export const DISCOUNT_TYPES = [
  { value: "percentage", label: "Discount by percentage" },
  { value: "amount", label: "Discount by amount" },
  { value: "fixed", label: "Fixed sale price" },
];

// Each attribute declares its operators and which value editor renders for it.
// `collection` and `specific products` are intentionally absent — those are
// handled by the dedicated resource pickers above the condition builder.
export const CONDITION_ATTRIBUTES = [
  { value: "type", label: "Product type", editor: "search", source: "productTypes", operators: ["is", "is-not"] },
  { value: "vendor", label: "Vendor", editor: "search", source: "vendors", operators: ["is", "is-not"] },
  { value: "tags", label: "Tags", editor: "tags", source: "tags", operators: ["has", "not-has"] },
  { value: "title", label: "Title", editor: "text", operators: ["contains", "starts-with", "ends-with"] },
  { value: "status", label: "Status", editor: "select", source: "statuses", operators: ["is", "is-not"] },
  { value: "publish-date", label: "Publish date", editor: "date", operators: ["in-the-last", "is-before", "is-after"] },
  { value: "update-date", label: "Update date", editor: "date", operators: ["in-the-last", "is-before", "is-after"] },
];

export const OPERATOR_LABELS = {
  is: "is equal to",
  "is-not": "is not equal to",
  has: "has tags",
  "not-has": "doesn't have tags",
  contains: "contains",
  "starts-with": "starts with",
  "ends-with": "ends with",
  "in-the-last": "in the last",
  "is-before": "is before",
  "is-after": "is after",
};

/** Looks up an attribute's metadata, falling back to the first attribute. */
export function attributeMeta(attribute) {
  return (
    CONDITION_ATTRIBUTES.find((a) => a.value === attribute) ??
    CONDITION_ATTRIBUTES[0]
  );
}

/** The operator options ({value,label}) valid for a given attribute. */
export function operatorsFor(attribute) {
  return attributeMeta(attribute).operators.map((value) => ({
    value,
    label: OPERATOR_LABELS[value] ?? value,
  }));
}

export const DEACTIVATION_OPTIONS = [
  {
    value: "restore",
    label: "Restore prices exactly as they were before the sale activation",
    help: "If a product was already on sale, it returns to that sale price after deactivation.",
  },
  {
    value: "replace",
    label: "Replace current price with compare-at price and remove compare-at value",
    help: "Use this when the sale price should become the new regular price.",
  },
];

// ── Factories ───────────────────────────────────────────────────────────────

let _conditionSeq = 0;

/** A fresh, empty product-matching condition row. */
export function createCondition(attribute = "type") {
  const meta = attributeMeta(attribute);
  return {
    id: `c${++_conditionSeq}`,
    attribute,
    operator: meta.operators[0],
    value: "", // text / select / single-search / date / "in the last" days
    values: [], // multi-select editors (tags)
    tagMode: "any", // "any" (OR) | "all" (AND) — tags only
  };
}

/** Whether a condition row carries a usable value (for summary counting). */
export function conditionHasValue(condition) {
  if (attributeMeta(condition.attribute).editor === "tags") {
    return (condition.values?.length ?? 0) > 0;
  }
  return Boolean(condition.value?.toString().trim());
}

/** The default shape of a campaign form. `overrides` lets the edit route seed it. */
export function createEmptyCampaign(overrides = {}) {
  return {
    title: "",

    // Which products — resource-picker selections + optional matching rules
    allProducts: false,
    collections: [], // selected via the collection resource picker
    products: [], // selected via the product / variant resource picker
    conditionMode: "any", // "any" (OR) | "all" (AND)
    conditions: [createCondition()],
    excludeNone: true,
    excludedProducts: [], // selected via the product / variant resource picker

    // Discount value (mirrors the wizard's Pricing section)
    discountType: "percentage", // percentage | amount | fixed
    percentageValue: "",
    amountValue: "",
    fixedPriceValue: "",
    roundNearestDecimals: false,
    roundLastDecimal: false,

    // Scheduling
    activateAtTime: false,
    startDate: "",
    startTime: "",
    deactivateAuto: false,
    endDate: "",
    endTime: "",

    // Activation / deactivation
    overrideOtherSales: false,
    deactivationMode: "restore",

    // Tags
    tagsToAdd: "",
    tagsToRemove: "",

    ...overrides,
  };
}

// ── Event helpers (web components emit on currentTarget) ─────────────────────

export const readValue = (event) =>
  event?.currentTarget?.value ?? event?.target?.value ?? "";

export const readChecked = (event) =>
  event?.currentTarget?.checked ?? event?.target?.checked ?? false;

/**
 * Order-independent deep equality for plain JSON-like values (objects, arrays,
 * primitives). Used to decide whether the form differs from its saved baseline
 * so the Save Bar hides again when changes are reverted.
 */
export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => deepEqual(a[key], b[key]));
}

/**
 * Reads the selected value from an `s-choice-list`. Single-select choice lists
 * still emit through `currentTarget.values` (an array), so we take the first
 * entry and fall back to `value` for safety.
 */
export const readChoice = (event) => {
  const el = event?.currentTarget ?? event?.target;
  if (Array.isArray(el?.values)) return el.values[0] ?? "";
  return el?.value ?? "";
};

// ── Resource picker helpers ──────────────────────────────────────────────────
// The Resource Picker returns products, variants, and collections with slightly
// different shapes. These read defensively so one display row works for all.

export function resourceImage(resource) {
  return (
    resource?.images?.[0]?.originalSrc ??
    resource?.images?.[0]?.url ??
    resource?.image?.originalSrc ??
    resource?.image?.url ??
    undefined
  );
}

export function resourceSubtitle(resource) {
  if (!resource) return "";
  if (resource.product?.title) return resource.product.title; // a variant
  if (resource.totalVariants > 1) return `${resource.totalVariants} variants`;
  if (resource.productsCount != null) return `${resource.productsCount} products`;
  return resource.productType ?? "";
}

// ── Projections (drive the summary sidebar) ──────────────────────────────────

/** Human-readable start of the active window ("Immediately" when not scheduled). */
export function describeStart(campaign) {
  if (!campaign.activateAtTime) return "Immediately";
  return (
    [campaign.startDate, campaign.startTime].filter(Boolean).join(" ") ||
    "At scheduled time"
  );
}

/** Human-readable end of the active window ("No end date" when open-ended). */
export function describeEnd(campaign) {
  if (!campaign.deactivateAuto) return "No end date";
  return (
    [campaign.endDate, campaign.endTime].filter(Boolean).join(" ") ||
    "At scheduled time"
  );
}

/**
 * Maps a campaign's status string to a valid s-badge tone.
 * Valid values: success | info | caution | warning | critical | undefined (default).
 */
export function campaignStatusTone(status) {
  switch (status?.toLowerCase()) {
    case "active":    return "success";
    case "scheduled": return "info";
    default:          return undefined; // "Ended" and unknown → unstyled (grey)
  }
}

/** "1 collection" / "3 collections" — naive English pluralization. */
function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function describeDiscount(campaign) {
  const { discountType, percentageValue, amountValue, fixedPriceValue } = campaign;
  if (discountType === "fixed") {
    return fixedPriceValue ? `Fixed price €${fixedPriceValue}` : "Fixed sale price";
  }
  if (discountType === "amount") {
    return amountValue ? `€${amountValue} off` : "Amount off";
  }
  return percentageValue ? `${percentageValue}% off` : "Percentage off";
}

/**
 * Projects the campaign state into the read-only structure rendered by the
 * Shopify-discounts-style summary sidebar: a title, a status badge, the headline
 * discount, and a bullet list of human-readable details.
 */
export function summarizeCampaign(campaign) {
  const details = [];

  // Scope
  if (campaign.allProducts) {
    details.push("Applies to all products");
  } else {
    const picked = campaign.collections.length + campaign.products.length;
    if (campaign.collections.length) {
      details.push(plural(campaign.collections.length, "collection"));
    }
    if (campaign.products.length) {
      details.push(plural(campaign.products.length, "product / variant"));
    }
    const matched = campaign.conditions.filter(conditionHasValue).length;
    if (matched) {
      const mode = campaign.conditionMode === "all" ? "all" : "any";
      // With nothing picked, conditions run against the whole store.
      details.push(
        picked
          ? `Refined by ${mode} of ${plural(matched, "condition")}`
          : `All store products matching ${mode} of ${plural(matched, "condition")}`,
      );
    }
    if (!picked && !matched) {
      details.push("No products selected yet");
    }
  }
  details.push(
    campaign.excludeNone || !campaign.excludedProducts.length
      ? "No product exclusions"
      : `${plural(campaign.excludedProducts.length, "product / variant")} excluded`,
  );

  // Pricing rules
  if (campaign.discountType === "percentage") {
    if (campaign.roundNearestDecimals) details.push("Rounded to nearest decimals");
    if (campaign.roundLastDecimal) details.push("Rounded to last decimal");
  }

  // Behavior
  details.push(
    campaign.overrideOtherSales
      ? "Overrides other Price Roll sales"
      : "Skips already-discounted products",
  );
  details.push(
    campaign.deactivationMode === "replace"
      ? "On end: replace price with compare-at"
      : "On end: restore previous prices",
  );

  // Tags
  if (campaign.tagsToAdd) details.push(`Adds tags: ${campaign.tagsToAdd}`);
  if (campaign.tagsToRemove) details.push(`Removes tags: ${campaign.tagsToRemove}`);

  // Status is derived from the schedule (no manual active toggle).
  const scheduled = campaign.activateAtTime;

  return {
    title: campaign.title?.trim() || "Untitled campaign",
    status: {
      label: scheduled ? "Scheduled" : "Active",
      tone: scheduled ? "info" : "success",
    },
    headline: describeDiscount(campaign),
    details,
    schedule: {
      start: describeStart(campaign),
      end: describeEnd(campaign),
    },
    performance: "0 products currently on sale",
  };
}
