export function mobileOrWebTemplate(
  webTemplate: string,
  isMobileContext: boolean
): string {
  const capturePathAndFilenameRegExp = /([a-z-]*\/)([a-z-]+\.njk)/;
  const mobileTemplatesFolderName = "mobile-templates";

  return isMobileContext
    ? webTemplate.replace(
        capturePathAndFilenameRegExp,
        `$1${mobileTemplatesFolderName}/$2`
      )
    : webTemplate;
}
