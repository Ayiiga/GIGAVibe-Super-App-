import { NativePurchases } from "@capgo/native-purchases";
import { verifyGooglePurchase } from "./billing.service";

export const PRODUCTS = {
  PRO: "gigavibe_pro_monthly",
  CREATOR: "gigavibe_creator_monthly",
};

export async function initPurchases() {
  await NativePurchases.initialize();
}

export async function buySubscription(args: {
  userId: string;
  email?: string;
  productId: string;
}) {
  const purchaseRes: any = await NativePurchases.purchase({
    productId: args.productId,
  });

  const purchaseToken =
    purchaseRes?.purchaseToken ||
    purchaseRes?.transaction?.purchaseToken ||
    purchaseRes?.transaction?.token;

  if (!purchaseToken) {
    throw new Error(
      "purchaseToken not found. Console.log(purchaseRes) and paste it to map."
    );
  }

  return verifyGooglePurchase({
    userId: args.userId,
    email: args.email,
    productId: args.productId,
    purchaseToken,
  });
}
