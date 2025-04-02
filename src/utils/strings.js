import { randomBytes } from "crypto";
import { promisify } from "util";
import xss from "xss";
export function containsNumber(value) {
    return value ? /\d/.test(value) : false;
}
export function containsNumbersOnly(value) {
    return value ? /^\d+$/.test(value) : false;
}
export function redactPhoneNumber(value) {
    return value ? value.trim().slice(value.length - 4) : undefined;
}
const asyncRandomBytes = promisify(randomBytes);
export async function generateNonce() {
    return (await asyncRandomBytes(16)).toString("hex");
}
export function sanitize(value) {
    let processed = xss(value);
    if (processed) {
        processed = processed.trim();
    }
    return processed;
}
export function splitSecretKeyIntoFragments(secretKey) {
    if (secretKey.length > 0) {
        return secretKey.match(/\w{1,4}/g);
    }
    return [];
}
