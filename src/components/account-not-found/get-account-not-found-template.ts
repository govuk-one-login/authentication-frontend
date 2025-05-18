import {
  SERVICE_TYPE,
  WEB_TO_MOBILE_TEMPLATE_MAPPINGS,
} from "../../app.constants.js";
import { getChannelSpecificTemplate } from "../../utils/get-channel-specific-template.js";
export function getAccountNotFoundTemplate(
  isOneLoginService: boolean,
  serviceType: string,
  isApp: boolean
): string {
  let webTemplate;

  if (isOneLoginService === true) {
    webTemplate = "account-not-found/index-one-login.njk";
  } else if (serviceType === SERVICE_TYPE.OPTIONAL) {
    webTemplate = "account-not-found/index-optional.njk";
  } else {
    webTemplate = "account-not-found/index-mandatory.njk";
  }

  return getChannelSpecificTemplate(
    webTemplate,
    isApp,
    WEB_TO_MOBILE_TEMPLATE_MAPPINGS
  );
}
