export function stringToUtf8Hex(str: string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function utf8HexToString(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }

  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}
