import {
  getRequestTaxonomy,
  Taxonomy,
  TaxonomyLevel1,
  TaxonomyLevel2,
} from "./taxonomy";

import { describe } from "mocha";
import { expect } from "chai";
import { UserSession } from "../types";

type Variant = {
  user?: Partial<UserSession>;
  path?: string;
  query?: { [key: string]: string };
};

type VariantExpectation = Variant & {
  expectedTaxonomy: Taxonomy;
};

const mappingsToTest: VariantExpectation[] = [
  {
    expectedTaxonomy: {
      taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
      taxonomyLevel2: TaxonomyLevel2.BLANK,
    },
  },
];

describe("getRequestTaxonomy", () => {
  mappingsToTest.forEach((mapping) => {
    it(`user (${JSON.stringify(mapping.user)}) on path (${mapping.path}) should map to taxonomy ${JSON.stringify(mapping.expectedTaxonomy)}`, async () => {
      const taxonomy = getRequestTaxonomy();
      expect(taxonomy).to.deep.equal(mapping.expectedTaxonomy);
    });
  });
});
