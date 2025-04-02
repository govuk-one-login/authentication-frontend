export function timestampNMinutesFromNow(numberOfMinutes) {
    return new Date(Date.now() + numberOfMinutes * 60000).toUTCString();
}
export function timestampNSecondsFromNow(numberOfSeconds) {
    return new Date(Date.now() + numberOfSeconds * 1000).toUTCString();
}
export function isLocked(maybeLockTimestamp) {
    return (maybeLockTimestamp &&
        new Date().getTime() < new Date(maybeLockTimestamp).getTime());
}
