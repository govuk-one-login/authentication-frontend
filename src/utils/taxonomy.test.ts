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

const mappingsToTest: VariantExpectation[] = [
  {
    expectedTaxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.BLANK,
    },
  },
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
