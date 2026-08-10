#!/usr/bin/env node

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.FUELWELL_SUPABASE_URL ??
  ""
)
  .trim()
  .replace(/\/$/, "");
const anonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.FUELWELL_SUPABASE_ANON_KEY ??
  ""
).trim();
const accounts = [
  {
    email: process.env.FUELWELL_UI_TEST_EMAIL?.trim(),
    password: process.env.FUELWELL_UI_TEST_PASSWORD,
  },
  {
    email: process.env.FUELWELL_UI_TEST_SECOND_EMAIL?.trim(),
    password: process.env.FUELWELL_UI_TEST_SECOND_PASSWORD,
  },
];

function fail(message) {
  throw new Error(message);
}

if (!supabaseUrl || !anonKey) fail("Supabase URL and anon key are required");
for (const [index, account] of accounts.entries()) {
  if (!account.email || !account.password)
    fail(`Dedicated test account ${index + 1} is required`);
}

async function authenticate(account) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: account.email,
        password: account.password,
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!response.ok)
    fail(
      `Dedicated test account authentication returned HTTP ${response.status}`,
    );
  const body = await response.json();
  if (!body.access_token || !body.user?.id)
    fail("Dedicated test account authentication was incomplete");
  return { accessToken: body.access_token, userId: body.user.id };
}

function headers(accessToken, prefer) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function rowUrl(userId, storeKey = "grocery_history") {
  const query = new URLSearchParams({
    select: "user_id,store_key,state_jsonb",
    user_id: `eq.${userId}`,
    store_key: `eq.${storeKey}`,
  });
  return `${supabaseUrl}/rest/v1/user_app_state?${query}`;
}

function profileUrl(userId) {
  const query = new URLSearchParams({
    select: "id,preferences_jsonb",
    id: `eq.${userId}`,
  });
  return `${supabaseUrl}/rest/v1/profiles?${query}`;
}

async function readRows(accessToken, userId) {
  const response = await fetch(rowUrl(userId), {
    headers: headers(accessToken),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) fail(`Reading test state returned HTTP ${response.status}`);
  return response.json();
}

async function upsertOwn(account, stateJsonb) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/user_app_state?on_conflict=user_id,store_key`,
    {
      method: "POST",
      headers: headers(
        account.accessToken,
        "resolution=merge-duplicates,return=representation",
      ),
      body: JSON.stringify({
        user_id: account.userId,
        store_key: "grocery_history",
        state_jsonb: stateJsonb,
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!response.ok)
    fail(`Writing owned test state returned HTTP ${response.status}`);
  return response.json();
}

async function deleteOwn(account) {
  const response = await fetch(rowUrl(account.userId), {
    method: "DELETE",
    headers: headers(account.accessToken),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    fail(`Cleaning up owned test state returned HTTP ${response.status}`);
}

async function readProfilePreferences(accessToken, userId) {
  const response = await fetch(profileUrl(userId), {
    headers: headers(accessToken),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    fail(`Reading profile preferences returned HTTP ${response.status}`);
  return response.json();
}

async function mergeOwnPreferences(account, patch) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/rpc/merge_own_profile_preferences`,
    {
      method: "POST",
      headers: headers(account.accessToken),
      body: JSON.stringify({ patch }),
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!response.ok)
    fail(`Merging owned profile preferences returned HTTP ${response.status}`);
  return response.json();
}

async function replaceOwnPreferences(account, preferences) {
  const response = await fetch(profileUrl(account.userId), {
    method: "PATCH",
    headers: headers(account.accessToken, "return=representation"),
    body: JSON.stringify({ preferences_jsonb: preferences }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    fail(
      `Restoring owned profile preferences returned HTTP ${response.status}`,
    );
  const rows = await response.json();
  if (rows.length !== 1)
    fail("Restoring owned profile preferences did not affect exactly one row");
}

const authenticated = [];
const originals = [];
const originalPreferences = [];
let verificationError = null;

try {
  authenticated.push(
    await authenticate(accounts[0]),
    await authenticate(accounts[1]),
  );
  if (authenticated[0].userId === authenticated[1].userId)
    fail("Test accounts must be different users");

  originals.push(
    await readRows(authenticated[0].accessToken, authenticated[0].userId),
    await readRows(authenticated[1].accessToken, authenticated[1].userId),
  );
  const initialPreferences = await Promise.all([
    readProfilePreferences(
      authenticated[0].accessToken,
      authenticated[0].userId,
    ),
    readProfilePreferences(
      authenticated[1].accessToken,
      authenticated[1].userId,
    ),
  ]);
  for (const [index, rows] of initialPreferences.entries()) {
    if (rows.length !== 1)
      fail(
        `Dedicated test account ${index + 1} must have exactly one profile row`,
      );
    originalPreferences.push(rows[0].preferences_jsonb ?? {});
  }

  const anonymous = await fetch(
    `${supabaseUrl}/rest/v1/user_app_state?select=user_id&limit=1`,
    {
      headers: headers(anonKey),
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (anonymous.ok)
    fail("Anonymous access unexpectedly reached user_app_state");

  const anonymousMerge = await fetch(
    `${supabaseUrl}/rest/v1/rpc/merge_own_profile_preferences`,
    {
      method: "POST",
      headers: headers(anonKey),
      body: JSON.stringify({
        patch: { releaseGateAccountIsolation: { owner: "anonymous" } },
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (anonymousMerge.ok)
    fail("Anonymous access unexpectedly reached merge_own_profile_preferences");

  const nonce = `release-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await upsertOwn(authenticated[0], { releaseGate: { owner: "A", nonce } });
  await upsertOwn(authenticated[1], { releaseGate: { owner: "B", nonce } });

  const aOwn = await readRows(
    authenticated[0].accessToken,
    authenticated[0].userId,
  );
  const bOwn = await readRows(
    authenticated[1].accessToken,
    authenticated[1].userId,
  );
  if (aOwn.length !== 1 || aOwn[0]?.state_jsonb?.releaseGate?.owner !== "A")
    fail("User A could not read owned state");
  if (bOwn.length !== 1 || bOwn[0]?.state_jsonb?.releaseGate?.owner !== "B")
    fail("User B could not read owned state");

  const bReadsA = await readRows(
    authenticated[1].accessToken,
    authenticated[0].userId,
  );
  if (bReadsA.length !== 0) fail("User B could read User A state");

  const crossInsert = await fetch(`${supabaseUrl}/rest/v1/user_app_state`, {
    method: "POST",
    headers: headers(authenticated[1].accessToken, "return=representation"),
    body: JSON.stringify({
      user_id: authenticated[0].userId,
      store_key: "grocery_history",
      state_jsonb: { releaseGate: { owner: "B-cross-insert", nonce } },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (crossInsert.ok) fail("User B could insert state owned by User A");

  for (const method of ["PATCH", "DELETE"]) {
    const response = await fetch(rowUrl(authenticated[0].userId), {
      method,
      headers: headers(authenticated[1].accessToken, "return=representation"),
      ...(method === "PATCH"
        ? {
            body: JSON.stringify({
              state_jsonb: { releaseGate: { owner: "B-cross-write", nonce } },
            }),
          }
        : {}),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok)
      fail(`Cross-user ${method} probe returned HTTP ${response.status}`);
    const affected = await response.json();
    if (affected.length !== 0) fail(`User B ${method} affected User A state`);
  }

  const aAfter = await readRows(
    authenticated[0].accessToken,
    authenticated[0].userId,
  );
  if (aAfter[0]?.state_jsonb?.releaseGate?.owner !== "A")
    fail("User A state changed during cross-user probes");

  const aMerged = await mergeOwnPreferences(authenticated[0], {
    releaseGateAccountIsolation: { owner: "A", nonce },
  });
  const bMerged = await mergeOwnPreferences(authenticated[1], {
    releaseGateAccountIsolation: { owner: "B", nonce },
  });
  if (aMerged?.releaseGateAccountIsolation?.owner !== "A")
    fail("User A could not merge owned profile preferences");
  if (bMerged?.releaseGateAccountIsolation?.owner !== "B")
    fail("User B could not merge owned profile preferences");

  const bReadsAProfile = await readProfilePreferences(
    authenticated[1].accessToken,
    authenticated[0].userId,
  );
  if (bReadsAProfile.length !== 0)
    fail("User B could read User A profile preferences");

  const crossProfileUpdate = await fetch(profileUrl(authenticated[0].userId), {
    method: "PATCH",
    headers: headers(authenticated[1].accessToken, "return=representation"),
    body: JSON.stringify({
      preferences_jsonb: {
        releaseGateAccountIsolation: { owner: "B-cross-write", nonce },
      },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!crossProfileUpdate.ok)
    fail(
      `Cross-user profile PATCH probe returned HTTP ${crossProfileUpdate.status}`,
    );
  const crossProfileRows = await crossProfileUpdate.json();
  if (crossProfileRows.length !== 0)
    fail("User B changed User A profile preferences");

  const aProfileAfter = await readProfilePreferences(
    authenticated[0].accessToken,
    authenticated[0].userId,
  );
  if (
    aProfileAfter[0]?.preferences_jsonb?.releaseGateAccountIsolation?.owner !==
    "A"
  ) {
    fail("User A profile preferences changed during cross-user probes");
  }

  const invalidKey = await fetch(`${supabaseUrl}/rest/v1/user_app_state`, {
    method: "POST",
    headers: headers(authenticated[0].accessToken, "return=representation"),
    body: JSON.stringify({
      user_id: authenticated[0].userId,
      store_key: "invalid_release_key",
      state_jsonb: { nonce },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (invalidKey.ok)
    fail("Invalid user_app_state store_key passed its constraint");

  console.log(
    "PASS: two authenticated users cannot read or mutate each other's app state",
  );
} catch (error) {
  verificationError = error;
} finally {
  const cleanupFailures = [];
  for (let index = 0; index < authenticated.length; index += 1) {
    try {
      const original = originals[index]?.[0];
      if (original) {
        await upsertOwn(authenticated[index], original.state_jsonb);
      } else {
        await deleteOwn(authenticated[index]);
      }
    } catch (error) {
      cleanupFailures.push(error);
    }
    try {
      if (originalPreferences[index] !== undefined) {
        await replaceOwnPreferences(
          authenticated[index],
          originalPreferences[index],
        );
      }
    } catch (error) {
      cleanupFailures.push(error);
    }
  }
  if (cleanupFailures.length > 0 && !verificationError) {
    verificationError = new Error(
      "Account-isolation verification cleanup failed",
    );
  }
}

if (verificationError) {
  console.error(
    `FAIL: ${verificationError instanceof Error ? verificationError.message : "account isolation verification failed"}`,
  );
  process.exit(1);
}
