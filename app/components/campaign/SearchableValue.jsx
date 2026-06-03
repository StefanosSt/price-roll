/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { readValue } from "../../lib/campaign";

/**
 * A lightweight searchable picker built from a search field plus a filtered
 * results list — Polaris web components have no native combobox. Selections show
 * as removable chips. Works for single values (Product type, Vendor) and multi
 * values (Tags). Filtering is client-side over `options`; swap that for a
 * backend search later without changing this component's shape.
 *
 * The results menu is rendered in a portal to <body> with fixed positioning so
 * it floats above the form instead of being clipped by the section card's
 * `overflow: hidden` (an absolutely-positioned menu can't escape that).
 *
 * @param {object} props
 * @param {string[]} props.options Candidate values to search.
 * @param {string} props.placeholder
 * @param {boolean} [props.multiple]
 * @param {string|string[]} props.selected string (single) or string[] (multi).
 * @param {(next: string|string[]) => void} props.onChange
 * @param {number} [props.limit] Max results shown (default 6).
 */
export function SearchableValue({
  options,
  placeholder = "Type to search",
  multiple = false,
  selected,
  onChange,
  limit = 6,
}) {
  const [query, setQuery] = useState("");
  const [menuRect, setMenuRect] = useState(null);
  const anchorRef = useRef(null);
  const menuRef = useRef(null);

  const chosen = multiple ? selected ?? [] : selected ? [selected] : [];

  const q = query.trim().toLowerCase();
  const results = q
    ? options
        .filter((opt) => opt.toLowerCase().includes(q) && !chosen.includes(opt))
        .slice(0, limit)
    : [];
  const open = results.length > 0;

  // Position the floating menu under the search field, tracking scroll/resize so
  // it stays anchored even inside scrollable containers.
  useEffect(() => {
    if (!open) return undefined;
    const updatePosition = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // Close the menu when clicking outside the field or the menu itself.
  useEffect(() => {
    if (!open) return undefined;
    const onDocMouseDown = (event) => {
      if (anchorRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setQuery("");
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const select = (opt) => {
    onChange(multiple ? [...chosen, opt] : opt);
    setQuery("");
  };

  const remove = (opt) => {
    onChange(multiple ? chosen.filter((o) => o !== opt) : "");
  };

  return (
    <s-stack direction="block" gap="small-200">
      {chosen.length > 0 && (
        <s-stack direction="inline" gap="small-400">
          {chosen.map((opt) => (
            <s-clickable-chip
              key={opt}
              removable
              accessibilityLabel={`Remove ${opt}`}
              onClick={() => remove(opt)}
            >
              {opt}
            </s-clickable-chip>
          ))}
        </s-stack>
      )}

      <div ref={anchorRef}>
        <s-search-field
          label="Search"
          labelAccessibilityVisibility="exclusive"
          placeholder={placeholder}
          value={query}
          onInput={(e) => setQuery(readValue(e))}
        ></s-search-field>
      </div>

      {open &&
        menuRect &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
              zIndex: 1000,
              maxHeight: "240px",
              overflowY: "auto",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            <s-box
              background="base"
              border="base"
              borderRadius="base"
              padding="small-200"
            >
              <s-stack direction="block" gap="small-500">
                {results.map((opt) => (
                  <s-clickable
                    key={opt}
                    padding="small-200"
                    borderRadius="base"
                    accessibilityLabel={`Select ${opt}`}
                    onClick={() => select(opt)}
                  >
                    <s-text>{opt}</s-text>
                  </s-clickable>
                ))}
              </s-stack>
            </s-box>
          </div>,
          document.body,
        )}
    </s-stack>
  );
}
