export function appendQueryParamIfHasValue(existingUrl, queryParamKey, queryParamValue) {
    if (!queryParamValue) {
        return existingUrl;
    }
    if (existingUrl.includes("?")) {
        return existingUrl + `&${queryParamKey}=${queryParamValue}`;
    }
    return existingUrl + `?${queryParamKey}=${queryParamValue}`;
}
