import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const CONFIRMATION_WINDOW_MS = 10 * 60_000;
const DEV_FALLBACK_SECRET = randomBytes(32).toString("hex");

type ConfirmationPayload = {
  v: 1;
  sub: string;
  conv: string;
  tool: string;
  inputHash: string;
  exp: number;
  nonce: string;
};

function encodeBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decodeBase64Url(input: string): string | null {
  try {
    return Buffer.from(input, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value === null || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, sortKeys(item)])
  );
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function conversationScope(conversationId?: string | null): string {
  return conversationId ?? "preview";
}

function hmacSignature(secret: string, payload: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

function safeBufferEqual(left: Buffer, right: Buffer): boolean {
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function resolveCoachConfirmationSecret(
  env: Record<string, string | undefined> = process.env
): string | null {
  return (
    env.COACH_CONFIRMATION_SECRET?.trim() ||
    env.AI_GATEWAY_API_KEY?.trim() ||
    env.ANTHROPIC_API_KEY?.trim() ||
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    (env.NODE_ENV === "production" ? null : DEV_FALLBACK_SECRET)
  );
}

export function hashCoachConfirmationInput(input: unknown): string {
  return createHmac("sha256", "fuelwell-coach-confirmation-input")
    .update(stableStringify(input))
    .digest("hex");
}

export function issueCoachConfirmationToken(params: {
  userId: string;
  conversationId?: string | null;
  toolName: string;
  input: unknown;
  now?: number;
  env?: Record<string, string | undefined>;
}): string | null {
  const secret = resolveCoachConfirmationSecret(params.env);
  if (!secret) return null;

  const payload: ConfirmationPayload = {
    v: 1,
    sub: params.userId,
    conv: conversationScope(params.conversationId),
    tool: params.toolName,
    inputHash: hashCoachConfirmationInput(params.input),
    exp: (params.now ?? Date.now()) + CONFIRMATION_WINDOW_MS,
    nonce: randomBytes(12).toString("base64url"),
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = hmacSignature(secret, encodedPayload).toString("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyCoachConfirmationToken(params: {
  token?: string | null;
  userId: string;
  conversationId?: string | null;
  toolName: string;
  input: unknown;
  now?: number;
  env?: Record<string, string | undefined>;
}): { ok: true } | { ok: false; reason: string } {
  if (!params.token) return { ok: false, reason: "missing_token" };

  const secret = resolveCoachConfirmationSecret(params.env);
  if (!secret) return { ok: false, reason: "missing_secret" };

  const [encodedPayload, encodedSignature] = params.token.split(".");
  if (!encodedPayload || !encodedSignature) {
    return { ok: false, reason: "malformed_token" };
  }

  const expectedSignature = hmacSignature(secret, encodedPayload);
  const actualSignature = Buffer.from(encodedSignature, "base64url");
  if (!safeBufferEqual(expectedSignature, actualSignature)) {
    return { ok: false, reason: "invalid_signature" };
  }

  const decoded = decodeBase64Url(encodedPayload);
  if (!decoded) return { ok: false, reason: "invalid_payload" };

  let payload: ConfirmationPayload;
  try {
    payload = JSON.parse(decoded) as ConfirmationPayload;
  } catch {
    return { ok: false, reason: "invalid_payload" };
  }

  if (payload.v !== 1) return { ok: false, reason: "unsupported_version" };
  if (payload.exp <= (params.now ?? Date.now())) return { ok: false, reason: "expired_token" };
  if (payload.sub !== params.userId) return { ok: false, reason: "wrong_user" };
  if (payload.conv !== conversationScope(params.conversationId)) {
    return { ok: false, reason: "wrong_conversation" };
  }
  if (payload.tool !== params.toolName) return { ok: false, reason: "wrong_tool" };
  if (payload.inputHash !== hashCoachConfirmationInput(params.input)) {
    return { ok: false, reason: "wrong_input" };
  }

  return { ok: true };
}
