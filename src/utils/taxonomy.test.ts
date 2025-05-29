import type { Taxonomy } from "./taxonomy.js";
import {
  getRequestTaxonomy,
  TaxonomyLevel1,
  TaxonomyLevel2,
  TaxonomyLevel3,
  TaxonomyLevel4,
  TaxonomyLevel5,
} from "./taxonomy.js";
import { describe } from "mocha";
import type { Request } from "express";
import { expect } from "chai";
import { CONTACT_US_THEMES, PATH_NAMES } from "../app.constants.js";
import type { ParsedQs } from "qs";

type RequestTaxonomyExpectation = { request: Request; taxonomy: Taxonomy };

const signInRequests: Request[] = [
  { session: { user: { isSignInJourney: true } } },
  { path: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE },
  { path: PATH_NAMES.ENTER_EMAIL_SIGN_IN },
  { path: PATH_NAMES.ENTER_MFA },
  { path: PATH_NAMES.ENTER_PASSWORD },
  { path: PATH_NAMES.RESEND_MFA_CODE },
] as Request[];
const reauthRequests: Request[] = [
  { session: { user: { reauthenticate: "samplevalue" } } },
] as Request[];
const createAccountRequests: Request[] = [
  { session: { user: { isAccountCreationJourney: true } } },
  { path: PATH_NAMES.CHECK_YOUR_EMAIL },
  { path: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER },
  { path: PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD },
  { path: PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL },
  { path: PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT },
  { path: PATH_NAMES.RESEND_EMAIL_CODE },
  { path: PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION },
] as Request[];
const accountRecoveryRequests: Request[] = [
  {
    session: {
      user: { isAccountRecoveryJourney: true, isAccountRecoveryPermitted: true },
    },
  },
  { path: PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION },
  { path: PATH_NAMES.RESET_PASSWORD },
  { path: PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP },
  { path: PATH_NAMES.RESET_PASSWORD_2FA_SMS },
  { path: PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL },
  { path: PATH_NAMES.RESET_PASSWORD_REQUIRED },
  { path: PATH_NAMES.RESET_PASSWORD_RESEND_CODE },
] as Request[];
const feedbackRequests: Request[] = [
  { path: PATH_NAMES.CONTACT_US },
  { path: PATH_NAMES.CONTACT_US_FROM_TRIAGE_PAGE },
  { path: PATH_NAMES.CONTACT_US_FURTHER_INFORMATION },
  { path: PATH_NAMES.CONTACT_US_QUESTIONS },
  { path: PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS },
] as Request[];
const guidanceRequests: Request[] = [
  {
    path: PATH_NAMES.CONTACT_US_QUESTIONS,
    query: { theme: CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK } as ParsedQs,
  },
] as Request[];
const accountInterventionRequests: Request[] = [
  { path: PATH_NAMES.PASSWORD_RESET_REQUIRED },
  { path: PATH_NAMES.UNAVAILABLE_PERMANENT },
  { path: PATH_NAMES.UNAVAILABLE_TEMPORARY },
] as Request[];
const mfaResetRequests: Request[] = [
  { path: PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES },
  { path: PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL },
] as Request[];

const expectations: RequestTaxonomyExpectation[] = [
  {
    request: {} as Request,
    taxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.BLANK,
      taxonomyLevel3: TaxonomyLevel3.BLANK,
      taxonomyLevel4: TaxonomyLevel4.BLANK,
      taxonomyLevel5: TaxonomyLevel5.BLANK,
    },
  },
  ...signInRequests.map((request) => ({
    request,
    taxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.SIGN_IN,
      taxonomyLevel3: TaxonomyLevel3.BLANK,
      taxonomyLevel4: TaxonomyLevel4.BLANK,
      taxonomyLevel5: TaxonomyLevel5.BLANK,
    },
  })),
  ...reauthRequests.map((request) => ({
    request,
    taxonomy: {
      taxonomyLevel1: TaxonomyLevel1.ACCOUNTS,
      taxonomyLevel2: TaxonomyLevel2.REAUTH,
      taxonomyLevel3: TaxonomyLevel3.BLANK,
      taxonomyLevel4: TaxonomyLevel4.BLANK,
      taxonomyLevel5: TaxonomyLevel5.BLANK,
    },
  })),
  ...createAccountRequests.map((request) => ({
    request,
    taxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.CREATE_ACCOUNT,
      taxonomyLevel3: TaxonomyLevel3.BLANK,
      taxonomyLevel4: TaxonomyLevel4.BLANK,
      taxonomyLevel5: TaxonomyLevel5.BLANK,
    },
  })),
  ...feedbackRequests.map((request) => ({
    request,
    taxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.FEEDBACK,
      taxonomyLevel3: TaxonomyLevel3.BLANK,
      taxonomyLevel4: TaxonomyLevel4.BLANK,
      taxonomyLevel5: TaxonomyLevel5.BLANK,
    },
  })),
  ...guidanceRequests.map((request) => ({
    request,
    taxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.GUIDANCE,
      taxonomyLevel3: TaxonomyLevel3.BLANK,
      taxonomyLevel4: TaxonomyLevel4.BLANK,
      taxonomyLevel5: TaxonomyLevel5.BLANK,
    },
  })),
  ...accountRecoveryRequests.map((request) => ({
    request,
    taxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.ACCOUNT_RECOVERY,
      taxonomyLevel3: TaxonomyLevel3.BLANK,
      taxonomyLevel4: TaxonomyLevel4.BLANK,
      taxonomyLevel5: TaxonomyLevel5.BLANK,
    },
  })),
  ...accountInterventionRequests.map((request) => ({
    request,
    taxonomy: {
      taxonomyLevel1: TaxonomyLevel1.ACCOUNTS,
      taxonomyLevel2: TaxonomyLevel2.ACCOUNT_INTERVENTION,
      taxonomyLevel3: TaxonomyLevel3.BLANK,
      taxonomyLevel4: TaxonomyLevel4.BLANK,
      taxonomyLevel5: TaxonomyLevel5.BLANK,
    },
  })),
  ...mfaResetRequests.map((request) => ({
    request,
    taxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.ACCOUNT_RECOVERY,
      taxonomyLevel3: TaxonomyLevel3.MFA_RESET,
      taxonomyLevel4: TaxonomyLevel4.BLANK,
      taxonomyLevel5: TaxonomyLevel5.BLANK,
    },
  })),
];

describe("getRequestTaxonomy", () => {
  beforeEach(() => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
  });

  expectations.forEach((expectation) => {
    it(`user (${JSON.stringify(expectation.request.session?.user)}) on path (${expectation.request.path}) should map to taxonomy ${JSON.stringify(expectation.taxonomy)}`, async () => {
      const taxonomy = getRequestTaxonomy(expectation.request);
      expect(taxonomy).to.deep.equal(expectation.taxonomy);
    });
  });
});
