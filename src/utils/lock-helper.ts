export function timestampNMinutesFromNow(numberOfMinutes: number) {
  return new Date(Date.now() + numberOfMinutes * 60000).toUTCString();
}

export function isLocked(maybeLockTimestamp?: string) {
  return (
    maybeLockTimestamp &&
    new Date().getTime() < new Date(maybeLockTimestamp).getTime()
  );
}
