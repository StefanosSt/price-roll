// Mock catalog values that back the "Match by condition" searchable fields.
// Frontend-only for now — swap these arrays for live Admin API lookups (product
// types, vendors, tags) once the app is wired to a backend.

export const PRODUCT_TYPES = [
  "Snowboard",
  "Ski",
  "Boots",
  "Bindings",
  "Helmet",
  "Goggles",
  "Gloves",
  "Jacket",
  "Accessories",
  "Gift Card",
];

export const VENDORS = [
  "Burton",
  "Salomon",
  "Rossignol",
  "K2",
  "Atomic",
  "Nike",
  "Adidas",
  "Patagonia",
  "The North Face",
  "Quiksilver",
];

export const PRODUCT_TAGS = [
  "on-sale",
  "new-arrival",
  "clearance",
  "bestseller",
  "winter-2026",
  "summer",
  "limited",
  "eco-friendly",
  "bundle",
  "staff-pick",
];

export const PRODUCT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

// Resolves an attribute's `source` key to its option list. Statuses use
// {value,label}; the free-text catalogs are plain strings.
export const CONDITION_SOURCES = {
  productTypes: PRODUCT_TYPES,
  vendors: VENDORS,
  tags: PRODUCT_TAGS,
  statuses: PRODUCT_STATUSES,
};
