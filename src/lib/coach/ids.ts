/**
 * Persisted FuelWell entities use UUID primary keys in Supabase. The prefix is
 * retained at call sites as useful intent documentation, but must never leak
 * into the stored identifier.
 */
export function newEntityId(prefix: string): string {
  void prefix;
  return crypto.randomUUID();
}
