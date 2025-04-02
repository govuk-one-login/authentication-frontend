import { supportAccountRecovery, supportReauthentication } from "../config";
import { CONTACT_US_THEMES, SERVICE_TYPE, SUPPORT_TYPE, } from "../app.constants";
export const isReauth = (req) => supportReauthentication() && Boolean(req.session?.user?.reauthenticate);
export const isUpliftRequired = (req) => Boolean(req.session?.user?.isUpliftRequired);
export const isAccountRecoveryJourney = (req) => Boolean(req.session?.user?.isAccountRecoveryJourney);
export const isAccountRecoveryJourneyAndEnabled = (req) => Boolean(supportAccountRecovery() &&
    req.session?.user?.isAccountRecoveryJourney &&
    req.session?.user?.isAccountRecoveryPermitted);
export const isContactUsSuggestionsFeedbackSubtheme = (req) => req.query?.subtheme === CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK;
export const clientIsOneLogin = (req) => Boolean(req.session?.client?.isOneLoginService);
export const clientUsesOneLoginOptionally = (req) => req.session?.client?.serviceType === SERVICE_TYPE.OPTIONAL;
export const supportTypeIsGovService = (req) => Boolean(req.query?.supportType === SUPPORT_TYPE.GOV_SERVICE ||
    req.body?.supportType === SUPPORT_TYPE.GOV_SERVICE);
export const urlContains = (req, str) => Boolean(req.originalUrl?.includes(str));
