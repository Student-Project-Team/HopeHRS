
export function makeStamp(action: string, userId: string): string {
  const stamp = `${action} by ${userId} on ${new Date().toISOString()}`;
  return stamp.substring(0, 60);
}
 