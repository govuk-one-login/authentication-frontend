export function addSecondsToDate(seconds) {
    return new Date(new Date().getTime() + 1000 * seconds).getTime();
}
