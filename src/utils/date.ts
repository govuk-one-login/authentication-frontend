export function addSecondsToDate(seconds: number): number {
  return new Date(new Date().getTime() + 1000 * seconds).getTime();
}
