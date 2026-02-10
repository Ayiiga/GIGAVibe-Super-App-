import { getEntitlement, type Entitlement } from "./billing.service";

let cached: Entitlement = { plan: "free", status: "inactive" };

export function getPlan() {
  return cached;
}

export async function refreshPlan(userId: string) {
  cached = await getEntitlement(userId);
  return cached;
}
