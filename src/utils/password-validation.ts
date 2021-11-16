import fs from "fs";
import path from "path";

const file = fs.readFileSync(
  path.resolve(__dirname, "../config/PwnedPasswordsTop100k.txt")
);

export function isCommonPassword(value: string): boolean {
  return file.includes(value);
}
