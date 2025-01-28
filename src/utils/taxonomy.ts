import { Request } from "express";
import { CONTACT_US_THEMES, PATH_NAMES } from "../app.constants";
import { supportAccountRecovery, supportReauthentication } from "../config";

export enum TaxonomyLevel1 {
  BLANK = "",
  AUTHENTICATION = "authentication",
  ACCOUNTS = "accounts",
}

export enum TaxonomyLevel2 {
  BLANK = "",
  SIGN_IN = "sign in",
  CREATE_ACCOUNT = "create account",
  ACCOUNT_INTERVENTION = "account intervention",
  ACCOUNT_RECOVERY = "account recovery",
  FEEDBACK = "feedback",
  GUIDANCE = "guidance",
  REAUTH = "re auth",
}

export enum TaxonomyLevel3 {
  BLANK = "",
}

export enum TaxonomyLevel4 {
  BLANK = "",
}

export enum TaxonomyLevel5 {
  BLANK = "",
}

export type Taxonomy = {
  taxonomyLevel1: TaxonomyLevel1;
  taxonomyLevel2: TaxonomyLevel2;
  taxonomyLevel3: TaxonomyLevel3;
  taxonomyLevel4: TaxonomyLevel4;
  taxonomyLevel5: TaxonomyLevel5;
};

export function getRequestTaxonomy(req: Request): Taxonomy {
  const taxonomyLevel2 = getTaxonomyLevel2(req);

  let taxonomyLevel1 = TaxonomyLevel1.BLANK;
  if (isAuthenticationTaxonomy(taxonomyLevel2))
    taxonomyLevel1 = TaxonomyLevel1.AUTHENTICATION;
  if (isAccountTaxonomy(taxonomyLevel2))
    taxonomyLevel1 = TaxonomyLevel1.ACCOUNTS;

  return {
    taxonomyLevel1,
    taxonomyLevel2,
    taxonomyLevel3: TaxonomyLevel3.BLANK,
    taxonomyLevel4: TaxonomyLevel4.BLANK,
    taxonomyLevel5: TaxonomyLevel5.BLANK,
  };
}

function getTaxonomyLevel2(req: Request) {
  let taxonomyLevel2 = TaxonomyLevel2.BLANK;

  if (isSignInTaxonomy(req)) taxonomyLevel2 = TaxonomyLevel2.SIGN_IN;
  if (isReauthTaxonomy(req)) taxonomyLevel2 = TaxonomyLevel2.REAUTH;
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

const isSignInTaxonomy = (req: Request): boolean =>
  req?.session?.user?.isSignInJourney ||
  [
    PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
    PATH_NAMES.ENTER_EMAIL_SIGN_IN,
    PATH_NAMES.ENTER_MFA,
    PATH_NAMES.ENTER_PASSWORD,
    PATH_NAMES.RESEND_MFA_CODE,
  ].includes(req.path);

const isReauthTaxonomy = (req: Request): boolean =>
  supportReauthentication() && Boolean(req?.session?.user?.reauthenticate);

const isCreateAccountTaxonomy = (req: Request): boolean =>
  req?.session?.user?.isAccountCreationJourney ||
  [
    PATH_NAMES.CHECK_YOUR_EMAIL,
    PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
    PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD,
    PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
    PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT,
    PATH_NAMES.RESEND_EMAIL_CODE,
    PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
  ].includes(req.path);

const isAccountRecoveryTaxonomy = (req: Request): boolean => {
  const isAccountRecoveryEnabledForEnvironment = supportAccountRecovery();

  return (
    (req?.session?.user?.isAccountRecoveryJourney &&
      req?.session?.user?.isAccountRecoveryPermitted &&
      isAccountRecoveryEnabledForEnvironment) ||
    [
      PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION,
      PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
      PATH_NAMES.RESET_PASSWORD,
      PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
      PATH_NAMES.RESET_PASSWORD_2FA_SMS,
      PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
      PATH_NAMES.RESET_PASSWORD_REQUIRED,
      PATH_NAMES.RESET_PASSWORD_RESEND_CODE,
    ].includes(req.path)
  );
};

const isAccountInterventionTaxonomy = (req: Request): boolean => {
  return [
    PATH_NAMES.PASSWORD_RESET_REQUIRED,
    PATH_NAMES.UNAVAILABLE_PERMANENT,
    PATH_NAMES.UNAVAILABLE_TEMPORARY,
  ].includes(req.path);
};

const isFeedbackTaxonomy = (req: Request): boolean => {
  return [
    PATH_NAMES.CONTACT_US,
    PATH_NAMES.CONTACT_US_FROM_TRIAGE_PAGE,
    PATH_NAMES.CONTACT_US_FURTHER_INFORMATION,
    PATH_NAMES.CONTACT_US_QUESTIONS,
    PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS,
  ].includes(req.path);
};

const isGuidanceTaxonomy = (req: Request): boolean => {
  return (
    [PATH_NAMES.CONTACT_US_QUESTIONS].includes(req.path) &&
    req.query?.theme === CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK
  );
};

const isAuthenticationTaxonomy = (taxonomyLevel2: TaxonomyLevel2): boolean =>
  [
    TaxonomyLevel2.ACCOUNT_RECOVERY,
    TaxonomyLevel2.BLANK,
    TaxonomyLevel2.CREATE_ACCOUNT,
    TaxonomyLevel2.FEEDBACK,
    TaxonomyLevel2.GUIDANCE,
    TaxonomyLevel2.SIGN_IN,
  ].includes(taxonomyLevel2);

const isAccountTaxonomy = (taxonomyLevel2: TaxonomyLevel2): boolean =>
  [TaxonomyLevel2.ACCOUNT_INTERVENTION, TaxonomyLevel2.REAUTH].includes(
    taxonomyLevel2
  );
