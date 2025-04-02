import { CONTACT_US_THEMES, PATH_NAMES } from "../app.constants";
import { isAccountRecoveryJourneyAndEnabled, isReauth as isReauthTaxonomy, } from "./request";
export var TaxonomyLevel1;
(function (TaxonomyLevel1) {
    TaxonomyLevel1["BLANK"] = "";
    TaxonomyLevel1["AUTHENTICATION"] = "authentication";
    TaxonomyLevel1["ACCOUNTS"] = "accounts";
})(TaxonomyLevel1 || (TaxonomyLevel1 = {}));
export var TaxonomyLevel2;
(function (TaxonomyLevel2) {
    TaxonomyLevel2["BLANK"] = "";
    TaxonomyLevel2["SIGN_IN"] = "sign in";
    TaxonomyLevel2["CREATE_ACCOUNT"] = "create account";
    TaxonomyLevel2["ACCOUNT_INTERVENTION"] = "account intervention";
    TaxonomyLevel2["ACCOUNT_RECOVERY"] = "account recovery";
    TaxonomyLevel2["FEEDBACK"] = "feedback";
    TaxonomyLevel2["GUIDANCE"] = "guidance";
    TaxonomyLevel2["REAUTH"] = "re auth";
})(TaxonomyLevel2 || (TaxonomyLevel2 = {}));
export var TaxonomyLevel3;
(function (TaxonomyLevel3) {
    TaxonomyLevel3["BLANK"] = "";
    TaxonomyLevel3["MFA_RESET"] = "mfa reset";
})(TaxonomyLevel3 || (TaxonomyLevel3 = {}));
export var TaxonomyLevel4;
(function (TaxonomyLevel4) {
    TaxonomyLevel4["BLANK"] = "";
})(TaxonomyLevel4 || (TaxonomyLevel4 = {}));
export var TaxonomyLevel5;
(function (TaxonomyLevel5) {
    TaxonomyLevel5["BLANK"] = "";
})(TaxonomyLevel5 || (TaxonomyLevel5 = {}));
export function getRequestTaxonomy(req) {
    const taxonomyLevel2 = getTaxonomyLevel2(req);
    const taxonomyLevel3 = getTaxonomyLevel3(req);
    let taxonomyLevel1 = TaxonomyLevel1.BLANK;
    if (isAuthenticationTaxonomy(taxonomyLevel2))
        taxonomyLevel1 = TaxonomyLevel1.AUTHENTICATION;
    if (isAccountTaxonomy(taxonomyLevel2))
        taxonomyLevel1 = TaxonomyLevel1.ACCOUNTS;
    return {
        taxonomyLevel1,
        taxonomyLevel2,
        taxonomyLevel3,
        taxonomyLevel4: TaxonomyLevel4.BLANK,
        taxonomyLevel5: TaxonomyLevel5.BLANK,
    };
}
function getTaxonomyLevel2(req) {
    let taxonomyLevel2 = TaxonomyLevel2.BLANK;
    if (isSignInTaxonomy(req))
        taxonomyLevel2 = TaxonomyLevel2.SIGN_IN;
    if (isReauthTaxonomy(req))
        taxonomyLevel2 = TaxonomyLevel2.REAUTH;
    if (isCreateAccountTaxonomy(req))
        taxonomyLevel2 = TaxonomyLevel2.CREATE_ACCOUNT;
    if (isFeedbackTaxonomy(req)) {
        taxonomyLevel2 = TaxonomyLevel2.FEEDBACK;
        if (isGuidanceTaxonomy(req)) {
            taxonomyLevel2 = TaxonomyLevel2.GUIDANCE;
        }
    }
    if (isAccountRecoveryTaxonomy(req))
        taxonomyLevel2 = TaxonomyLevel2.ACCOUNT_RECOVERY;
    if (isAccountInterventionTaxonomy(req))
        taxonomyLevel2 = TaxonomyLevel2.ACCOUNT_INTERVENTION;
    return taxonomyLevel2;
}
function getTaxonomyLevel3(req) {
    let taxonomyLevel3 = TaxonomyLevel3.BLANK;
    if (isMfaResetTaxonomy(req)) {
        taxonomyLevel3 = TaxonomyLevel3.MFA_RESET;
    }
    return taxonomyLevel3;
}
const isMfaResetTaxonomy = (req) => [
    PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
    PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
].includes(req.path);
const isSignInTaxonomy = (req) => req?.session?.user?.isSignInJourney ||
    [
        PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
        PATH_NAMES.ENTER_EMAIL_SIGN_IN,
        PATH_NAMES.ENTER_MFA,
        PATH_NAMES.ENTER_PASSWORD,
        PATH_NAMES.RESEND_MFA_CODE,
    ].includes(req.path);
const isCreateAccountTaxonomy = (req) => req?.session?.user?.isAccountCreationJourney ||
    [
        PATH_NAMES.CHECK_YOUR_EMAIL,
        PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
        PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
        PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
        PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
        PATH_NAMES.RESEND_EMAIL_CODE,
        PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
    ].includes(req.path);
const isAccountRecoveryTaxonomy = (req) => {
    return (isAccountRecoveryJourneyAndEnabled(req) ||
        [
            PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION,
            PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
            PATH_NAMES.RESET_PASSWORD,
            PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
            PATH_NAMES.RESET_PASSWORD_2FA_SMS,
            PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
            PATH_NAMES.RESET_PASSWORD_REQUIRED,
            PATH_NAMES.RESET_PASSWORD_RESEND_CODE,
            PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
            PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
        ].includes(req.path));
};
const isAccountInterventionTaxonomy = (req) => {
    return [
        PATH_NAMES.PASSWORD_RESET_REQUIRED,
        PATH_NAMES.UNAVAILABLE_PERMANENT,
        PATH_NAMES.UNAVAILABLE_TEMPORARY,
    ].includes(req.path);
};
const isFeedbackTaxonomy = (req) => {
    return [
        PATH_NAMES.CONTACT_US,
        PATH_NAMES.CONTACT_US_FROM_TRIAGE_PAGE,
        PATH_NAMES.CONTACT_US_FURTHER_INFORMATION,
        PATH_NAMES.CONTACT_US_QUESTIONS,
        PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS,
    ].includes(req.path);
};
const isGuidanceTaxonomy = (req) => {
    return ([PATH_NAMES.CONTACT_US_QUESTIONS].includes(req.path) &&
        req.query?.theme === CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK);
};
const isAuthenticationTaxonomy = (taxonomyLevel2) => [
    TaxonomyLevel2.ACCOUNT_RECOVERY,
    TaxonomyLevel2.BLANK,
    TaxonomyLevel2.CREATE_ACCOUNT,
    TaxonomyLevel2.FEEDBACK,
    TaxonomyLevel2.GUIDANCE,
    TaxonomyLevel2.SIGN_IN,
].includes(taxonomyLevel2);
const isAccountTaxonomy = (taxonomyLevel2) => [TaxonomyLevel2.ACCOUNT_INTERVENTION, TaxonomyLevel2.REAUTH].includes(taxonomyLevel2);
