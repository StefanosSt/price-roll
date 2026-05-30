/**
 * Reusable campaign form (the discount-editor style fields). Shared by the
 * "new" and "edit" campaign routes. Static for now — wiring comes later.
 */
export function CampaignForm() {
  return (
    <>
      <s-section heading="Campaign name">
        <s-text-field
          label="Campaign name"
          labelAccessibilityVisibility="exclusive"
          name="name"
          placeholder="e.g. Summer Sale 2026"
        ></s-text-field>
      </s-section>

      <s-section heading="Discount value">
        <s-stack direction="block" gap="base">
          <s-grid gridTemplateColumns="2fr 1fr" gap="base">
            <s-select
              label="Discount type"
              labelAccessibilityVisibility="exclusive"
              name="type"
              value="percentage"
            >
              <s-option value="percentage">Percentage</s-option>
              <s-option value="fixed">Fixed amount</s-option>
            </s-select>
            <s-number-field
              label="Value"
              labelAccessibilityVisibility="exclusive"
              name="value"
              suffix="%"
              min={0}
              max={100}
            ></s-number-field>
          </s-grid>

          <s-grid gridTemplateColumns="1fr 1fr" gap="base">
            <s-select label="Applies to" name="appliesTo" value="collections">
              <s-option value="collections">Specific collections</s-option>
              <s-option value="products">Specific products</s-option>
              <s-option value="all">All products</s-option>
            </s-select>
            <s-select
              label="Purchase type"
              name="purchaseType"
              value="one-time"
            >
              <s-option value="one-time">One-time purchase</s-option>
              <s-option value="subscription">Subscription</s-option>
              <s-option value="both">Both</s-option>
            </s-select>
          </s-grid>

          <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="end">
            <s-search-field
              label="Search collections"
              labelAccessibilityVisibility="exclusive"
              placeholder="Search collections"
            ></s-search-field>
            <s-button variant="secondary">Browse</s-button>
          </s-grid>
        </s-stack>
      </s-section>

      <s-section heading="Eligibility">
        <s-select
          label="Eligibility"
          labelAccessibilityVisibility="exclusive"
          name="eligibility"
          value="all"
        >
          <s-option value="all">All customers</s-option>
          <s-option value="segments">Specific customer segments</s-option>
        </s-select>
      </s-section>

      <s-section heading="Minimum purchase requirements">
        <s-choice-list
          label="Minimum purchase requirements"
          labelAccessibilityVisibility="exclusive"
          name="minimum"
        >
          <s-choice value="none" selected>
            No minimum requirements
          </s-choice>
          <s-choice value="amount">Minimum purchase amount (€)</s-choice>
          <s-choice value="quantity">Minimum quantity of items</s-choice>
        </s-choice-list>
      </s-section>

      <s-section heading="Maximum discount uses">
        <s-stack direction="block" gap="small">
          <s-checkbox
            label="Limit number of times this discount can be used in total"
            name="limitTotal"
          ></s-checkbox>
          <s-checkbox
            label="Limit to one use per customer"
            name="limitPerCustomer"
          ></s-checkbox>
        </s-stack>
      </s-section>

      <s-section heading="Combinations">
        <s-stack direction="block" gap="small">
          <s-checkbox label="Product discounts" name="comboProduct"></s-checkbox>
          <s-checkbox label="Order discounts" name="comboOrder"></s-checkbox>
          <s-checkbox
            label="Shipping discounts"
            name="comboShipping"
          ></s-checkbox>
        </s-stack>
      </s-section>

      <s-section heading="Active dates">
        <s-stack direction="block" gap="base">
          <s-grid gridTemplateColumns="1fr 1fr" gap="base">
            <s-date-field
              label="Start date"
              name="startDate"
              value="2026-05-30"
            ></s-date-field>
            <s-text-field
              label="Start time (EDT)"
              name="startTime"
              value="7:57 AM"
            ></s-text-field>
          </s-grid>
          <s-checkbox label="Set end date" name="setEndDate"></s-checkbox>
        </s-stack>
      </s-section>
    </>
  );
}
