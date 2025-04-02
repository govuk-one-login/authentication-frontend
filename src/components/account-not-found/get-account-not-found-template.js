import { SERVICE_TYPE, WEB_TO_MOBILE_TEMPLATE_MAPPINGS, } from "../../app.constants";
import { getChannelSpecificTemplate } from "../../utils/get-channel-specific-template";
export function getAccountNotFoundTemplate(isOneLoginService, serviceType, isStrategicAppChannel) {
    let webTemplate;
    if (isOneLoginService === true) {
        webTemplate = "account-not-found/index-one-login.njk";
    }
    else if (serviceType === SERVICE_TYPE.OPTIONAL) {
        webTemplate = "account-not-found/index-optional.njk";
    }
    else {
        webTemplate = "account-not-found/index-mandatory.njk";
    }
    return getChannelSpecificTemplate(webTemplate, isStrategicAppChannel, WEB_TO_MOBILE_TEMPLATE_MAPPINGS);
}
