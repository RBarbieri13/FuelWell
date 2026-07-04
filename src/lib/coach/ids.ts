/** Unique-enough ids for coach-created entities (meals, workouts, grocery items). */
export function newEntityId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
