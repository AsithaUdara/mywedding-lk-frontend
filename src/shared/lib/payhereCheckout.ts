function formatPayHereAmount(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value ?? "");
  return n.toFixed(2);
}

/** Submit PayHere checkout via auto-posted form (POST required by PayHere). */
export function submitPayHereCheckout(
  checkout: Record<string, unknown>,
  options?: { target?: "_self" | "_blank" }
) {
  const checkoutUrl = checkout.checkoutUrl;
  if (!checkoutUrl || typeof checkoutUrl !== "string") {
    throw new Error("Checkout URL missing from payment response.");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  // Same-window avoids popup blockers after async fetch (planner/vendor billing).
  form.target = options?.target ?? "_self";

  Object.entries(checkout).forEach(([key, value]) => {
    if (key === "checkoutUrl") return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value =
      key === "amount" ? formatPayHereAmount(value) : String(value ?? "");
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
