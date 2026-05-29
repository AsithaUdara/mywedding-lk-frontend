/** Submit PayHere checkout via auto-posted form (matches BookingModal behaviour). */
export function submitPayHereCheckout(checkout: Record<string, unknown>) {
  const checkoutUrl = checkout.checkoutUrl;
  if (!checkoutUrl || typeof checkoutUrl !== "string") {
    throw new Error("Checkout URL missing from payment response.");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  form.target = "_blank";

  Object.entries(checkout).forEach(([key, value]) => {
    if (key === "checkoutUrl") return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value ?? "");
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}
