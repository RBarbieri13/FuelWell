import type { Provider } from "@supabase/supabase-js";

type NativeOAuthPayload = {
  authorizationURL: string;
  provider: Provider;
  next: string;
};

type NativeOAuthMessageHandler = {
  postMessage: (payload: NativeOAuthPayload) => void;
};

type FuelWellNativeWindow = Window & {
  webkit?: {
    messageHandlers?: {
      fuelwellOAuth?: NativeOAuthMessageHandler;
    };
  };
};

export type NativeAuthCallback = {
  code: string | null;
  providerError: string | null;
  next: string;
};

const DEFAULT_AUTH_DESTINATION = "/app/dashboard";

export function safeNativeAuthNextPath(candidate: string | null | undefined): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return DEFAULT_AUTH_DESTINATION;
  }
  if (candidate.includes("\\") || /[\u0000-\u001f\u007f]/.test(candidate)) {
    return DEFAULT_AUTH_DESTINATION;
  }

  try {
    const base = new URL("https://fuelwell.invalid");
    const resolved = new URL(candidate, base);
    if (resolved.origin !== base.origin) return DEFAULT_AUTH_DESTINATION;
    if (resolved.pathname !== "/app" && !resolved.pathname.startsWith("/app/")) {
      return DEFAULT_AUTH_DESTINATION;
    }
    return `${resolved.pathname}${resolved.search}`;
  } catch {
    return DEFAULT_AUTH_DESTINATION;
  }
}

export function parseNativeAuthCallback(search: string): NativeAuthCallback {
  const params = new URLSearchParams(search);
  const next = safeNativeAuthNextPath(params.get("next"));

  return {
    code: params.get("code"),
    providerError: params.get("error_description"),
    next,
  };
}

export function getNativeOAuthMessageHandler(): NativeOAuthMessageHandler | null {
  if (typeof window === "undefined") return null;
  return (window as FuelWellNativeWindow).webkit?.messageHandlers?.fuelwellOAuth ?? null;
}
