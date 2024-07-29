export function redactEmail(value: string): string {
  const asterisks = "***";
  let prefix = "";
  let domain = "";

  const email_fragments = value.split("@");

  if (email_fragments.length === 2) {
    [prefix, domain] = email_fragments;
    return `${prefix.substring(0, 3)}${asterisks}@${domain}`;
  }
  return "";
}
