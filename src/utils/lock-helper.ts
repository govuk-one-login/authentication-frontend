export function timestampNMinutesFromNow(numberOfMinutes: number) {
  return new Date(Date.now() + numberOfMinutes * 60000).toUTCString();
}
