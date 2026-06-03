import { useCallback, useMemo, useState } from "react";
import {
  attributeMeta,
  createCondition,
  createEmptyCampaign,
  deepEqual,
  summarizeCampaign,
} from "../lib/campaign";

/**
 * Owns all campaign form state and exposes a small, stable API. Both the form
 * (write) and the summary sidebar (read) consume the same instance, so the
 * sidebar always mirrors the form live — like Shopify's discount editor.
 *
 * `dirty` is derived by comparing the current state against a saved baseline, so
 * reverting an edit (e.g. retyping the original title) hides the Save Bar again.
 *
 * @param {object} [initial] Partial campaign used to seed the form (edit route).
 */
export function useCampaignForm(initial) {
  // Created once: serves as both the first state and the comparison baseline.
  // (Re-running createEmptyCampaign would mint new condition ids and never match.)
  const [baseline, setBaseline] = useState(() => createEmptyCampaign(initial));
  const [campaign, setCampaign] = useState(baseline);

  // Generic field setter — `update("title", "Summer Sale")`.
  const update = useCallback((field, value) => {
    setCampaign((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Convenience for checkbox/switch handlers bound to a field.
  const toggle = useCallback((field) => {
    setCampaign((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const addCondition = useCallback(() => {
    setCampaign((prev) => ({
      ...prev,
      conditions: [...prev.conditions, createCondition()],
    }));
  }, []);

  const removeCondition = useCallback((id) => {
    setCampaign((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c.id !== id),
    }));
  }, []);

  const updateCondition = useCallback((id, field, value) => {
    setCampaign((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, [field]: value };
        // Changing the attribute resets the operator/value to valid defaults.
        if (field === "attribute") {
          next.operator = attributeMeta(value).operators[0];
          next.value = "";
          next.values = [];
          next.tagMode = "any";
        }
        return next;
      }),
    }));
  }, []);

  // Restore the saved baseline (Discard).
  const reset = useCallback(() => setCampaign(baseline), [baseline]);

  // After a successful save, the current state becomes the new baseline.
  const markSaved = useCallback(() => setBaseline(campaign), [campaign]);

  // True only while the form differs from the last saved baseline.
  const dirty = useMemo(
    () => !deepEqual(campaign, baseline),
    [campaign, baseline],
  );

  // Recomputed only when the campaign changes — drives the summary sidebar.
  const summary = useMemo(() => summarizeCampaign(campaign), [campaign]);

  return {
    campaign,
    summary,
    dirty,
    update,
    toggle,
    addCondition,
    removeCondition,
    updateCondition,
    reset,
    markSaved,
  };
}
