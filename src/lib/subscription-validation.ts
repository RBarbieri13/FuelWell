import { timingSafeEqual } from "crypto";
import { z } from "zod";

export const subscriptionProviders = ["manual", "revenue_cat", "stripe"] as const;
export const subscriptionEnvironments = ["sandbox", "production"] as const;
export const entitlementTiers = [
  "pilot",
  "pro",
  "premium",
  "founding100Lifetime",
] as const;

export const subscriptionValidationSchema = z.object({
  userId: z.string().uuid(),
  provider: z.enum(subscriptionProviders),
  productId: z.string().trim().min(1).max(128),
  environment: z.enum(subscriptionEnvironments),
  entitlementTier: z.enum(entitlementTiers),
  providerCustomerId: z.string().trim().max(256).optional().nullable(),
  providerEventId: z.string().trim().max(256).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type SubscriptionValidationPayload = z.infer<
  typeof subscriptionValidationSchema
>;

export type SubscriptionValidationRPCArgs = {
  target_user_id: string;
  target_provider: SubscriptionValidationPayload["provider"];
  target_product_id: string;
  target_environment: SubscriptionValidationPayload["environment"];
  target_entitlement_tier: SubscriptionValidationPayload["entitlementTier"];
  target_provider_customer_id: string | null;
  target_provider_event_id: string | null;
  target_metadata: Record<string, unknown>;
};

export function parseSubscriptionValidationPayload(
  body: unknown,
): SubscriptionValidationPayload {
  return subscriptionValidationSchema.parse(body);
}

export function buildSubscriptionValidationRPCArgs(
  payload: SubscriptionValidationPayload,
): SubscriptionValidationRPCArgs {
  return {
    target_user_id: payload.userId,
    target_provider: payload.provider,
    target_product_id: payload.productId.trim(),
    target_environment: payload.environment,
    target_entitlement_tier: payload.entitlementTier,
    target_provider_customer_id: payload.providerCustomerId?.trim() || null,
    target_provider_event_id: payload.providerEventId?.trim() || null,
    target_metadata: {
      ...payload.metadata,
      validation_source: "fuelwell_next_api",
    },
  };
}

export function isValidSubscriptionValidationSecret(
  receivedSecret: string | null,
  expectedSecret = process.env.SUBSCRIPTION_VALIDATION_SECRET,
): boolean {
  if (!receivedSecret || !expectedSecret) return false;

  const received = Buffer.from(receivedSecret);
  const expected = Buffer.from(expectedSecret);
  if (received.length !== expected.length) return false;

  return timingSafeEqual(received, expected);
}
