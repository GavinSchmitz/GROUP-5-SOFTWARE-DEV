export const STARTER_CREDITS = 3;
export const CREDITS_PER_HOUR = 1;

export function durationToCredits(durationMinutes: number): number {
  return Math.ceil(durationMinutes / 60);
}
