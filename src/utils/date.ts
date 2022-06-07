export function addSecondsToDate(seconds: number): Date {
  return new Date(new Date().getTime() + 1000 * seconds);
}
