export function containsNumber(value: string): boolean {
  return value ? /\d/.test(value) : false;
}

export function containsNumbersOnly(value: string): boolean {
  return value ? /^\d+$/.test(value) : false;
}
