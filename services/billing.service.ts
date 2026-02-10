const BILLING_BASE =
  (import.meta as any).env?.VITE_BILLING_BASE_URL || "http://localhost:4000";

export type Entitlement = {
  plan: "free" | "pro" | "creator";
  status: "inactive" | "active" | "grace" | "paused" | "canceled" | "expired";
  product_id?: string;
  current_period_end?: string;
  auto_renew?: boolean;
};

export async function getEntitlement(userId: string): Promise<Entitlement> {
  const res = await fetch(`${BILLING_BASE}/billing/entitlement/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function verifyGooglePurchase(args: {
  userId: string;
  email?: string;
  productId: string;
  purchaseToken: string;
}) {
  const res = await fetch(`${BILLING_BASE}/billing/google/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
