/**
 * Generates a human-readable audit stamp.
 * Example output: "DEACTIVATED by user123 on 2025-01-15T10:30:00.000Z"
 */
export function makeStamp(action: string, userId: string): string {
  return `${action} by ${userId} on ${new Date().toISOString()}`;
}