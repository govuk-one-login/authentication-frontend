import { SERVICE_TYPE } from "../../app.constants";

export function getAccountNotFoundWebTemplate(
  isOneLoginService: boolean,
  serviceType: string
): string {
  if (isOneLoginService === true) {
    return "account-not-found/index-one-login.njk";
  }

  if (serviceType === SERVICE_TYPE.OPTIONAL) {
    return "account-not-found/index-optional.njk";
  }

  return "account-not-found/index-mandatory.njk";
}
