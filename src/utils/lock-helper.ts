export function timestampNMinutesFromNow(numberOfMinutes: number): string {
  return new Date(Date.now() + numberOfMinutes * 60000).toUTCString();
}

export function timestampNSecondsFromNow(numberOfSeconds: number): string {
  return new Date(Date.now() + numberOfSeconds * 1000).toUTCString();
}

export function isLocked(maybeLockTimestamp?: string): boolean {
  return (
    maybeLockTimestamp && new Date().getTime() < new Date(maybeLockTimestamp).getTime()
  );
}
