import { SERVICE_TYPE } from "../../app.constants.js";

export function getAccountNotFoundTemplate(
  isOneLoginService: boolean,
  serviceType: string,
  isApp: boolean
): string {
  if (isApp) {
    return "account-not-found/index-mobile.njk";
  }

  if (isOneLoginService) {
    return "account-not-found/index-one-login.njk";
  }

  if (serviceType === SERVICE_TYPE.OPTIONAL) {
    return "account-not-found/index-optional.njk";
  }

  return "account-not-found/index-mandatory.njk";
}
