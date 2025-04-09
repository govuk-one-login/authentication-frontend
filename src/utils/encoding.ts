import { InvalidBase64Error } from "./error.js";
export function base64DecodeToUint8Array(value: string): Uint8Array {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");

  const isBase64 =
    /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(base64);
  if (!isBase64) {
    throw new InvalidBase64Error("String is not valid base64: " + value);
  }

  const rawData = Buffer.from(base64, "base64");
  return new Uint8Array(rawData);
}
