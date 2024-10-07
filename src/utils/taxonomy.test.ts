import {
  getRequestTaxonomy,
  Taxonomy,
  TaxonomyLevel1,
  TaxonomyLevel2,
} from "./taxonomy";

import { describe } from "mocha";
import { Request } from "express";
import { expect } from "chai";
import { UserSession } from "../types";
import { CONTACT_US_THEMES, PATH_NAMES } from "../app.constants";

type Variant = {
  user?: Partial<UserSession>;
  path?: string;
  query?: { [key: string]: string };
};

type VariantExpectation = Variant & {
  expectedTaxonomy: Taxonomy;
};

const signInVariants: Variant[] = [
  { user: { isSignInJourney: true } },
  { path: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE },
  { path: PATH_NAMES.ENTER_EMAIL_SIGN_IN },
  { path: PATH_NAMES.ENTER_MFA },
  { path: PATH_NAMES.ENTER_PASSWORD },
  { path: PATH_NAMES.RESEND_MFA_CODE },
];
const createAccountVariants: Variant[] = [
  { user: { isAccountCreationJourney: true } },
  { path: PATH_NAMES.CHECK_YOUR_EMAIL },
  { path: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER },
  { path: PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD },
  { path: PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL },
  { path: PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT },
  { path: PATH_NAMES.RESEND_EMAIL_CODE },
  { path: PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION },
];
const accountRecoveryVariants: Variant[] = [
  {
    user: {
      isAccountRecoveryJourney: true,
      isAccountRecoveryPermitted: true,
    },
  },
  { path: PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION },
  { path: PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES },
  { path: PATH_NAMES.RESET_PASSWORD },
  { path: PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP },
  { path: PATH_NAMES.RESET_PASSWORD_2FA_SMS },
  { path: PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL },
  { path: PATH_NAMES.RESET_PASSWORD_REQUIRED },
  { path: PATH_NAMES.RESET_PASSWORD_RESEND_CODE },
];
const feedbackVariants: Variant[] = [
  { path: PATH_NAMES.CONTACT_US },
  { path: PATH_NAMES.CONTACT_US_FROM_TRIAGE_PAGE },
  { path: PATH_NAMES.CONTACT_US_FURTHER_INFORMATION },
  { path: PATH_NAMES.CONTACT_US_QUESTIONS },
  { path: PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS },
];
const guidanceVariants: Variant[] = [
  {
    path: PATH_NAMES.CONTACT_US_QUESTIONS,
    query: {
      theme: CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK,
    },
  },
];
const accountInterventionVariants: Variant[] = [
  { path: PATH_NAMES.PASSWORD_RESET_REQUIRED },
  { path: PATH_NAMES.UNAVAILABLE_PERMANENT },
  { path: PATH_NAMES.UNAVAILABLE_TEMPORARY },
];

const mappingsToTest: VariantExpectation[] = [
  {
    expectedTaxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.BLANK,
    },
  },
  ...signInVariants.map((t) => ({
    ...t,
    expectedTaxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.SIGN_IN,
    },
  })),
  ...createAccountVariants.map((t) => ({
    ...t,
    expectedTaxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.CREATE_ACCOUNT,
    },
  })),
  ...feedbackVariants.map((t) => ({
    ...t,
    expectedTaxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.FEEDBACK,
    },
  })),
  ...guidanceVariants.map((t) => ({
    ...t,
    expectedTaxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.GUIDANCE,
    },
  })),
  ...accountRecoveryVariants.map((t) => ({
    ...t,
    expectedTaxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.ACCOUNT_RECOVERY,
    },
  })),
  ...accountInterventionVariants.map((t) => ({
    ...t,
    expectedTaxonomy: {
      taxonomyLevel1: TaxonomyLevel1.ACCOUNTS,
      taxonomyLevel2: TaxonomyLevel2.ACCOUNT_INTERVENTION,
    },
  })),
];

describe("getRequestTaxonomy", () => {
  beforeEach(() => {
    process.env.SUPPORT_ACCOUNT_RECOVERY = "1";
    process.env.SUPPORT_REAUTHENTICATION = "1";
  });

  mappingsToTest.forEach((mapping) => {
    it(`user (${JSON.stringify(mapping.user)}) on path (${mapping.path}) should map to taxonomy ${JSON.stringify(mapping.expectedTaxonomy)}`, async () => {
      const taxonomy = getRequestTaxonomy({
        session: { user: mapping.user },
        path: mapping.path,
        query: mapping.query,
      } as Request);
      expect(taxonomy).to.deep.equal(mapping.expectedTaxonomy);
    });
  });
});
