export function appendQueryParamIfHasValue(
  existingUrl: string,
  queryParamKey: string,
  queryParamValue: string
): string {
  if (!queryParamValue) {
    return existingUrl;
  }
  if (existingUrl.includes("?")) {
    return existingUrl + `&${queryParamKey}=${queryParamValue}`;
  }
  return existingUrl + `?${queryParamKey}=${queryParamValue}`;
}
