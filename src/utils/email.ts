export function redactEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  return localPart[0] + "***@" + domain;
}
