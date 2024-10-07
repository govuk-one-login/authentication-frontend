import { Request } from "express";
import { CONTACT_US_THEMES, PATH_NAMES } from "../app.constants";

export enum TaxonomyLevel1 {
  BLANK = "",
  AUTHENTICATION = "authentication",
}

export enum TaxonomyLevel2 {
  BLANK = "",
  FEEDBACK = "feedback",
  GUIDANCE = "guidance",
}

export type Taxonomy = {
  taxonomyLevel1: TaxonomyLevel1;
  taxonomyLevel2: TaxonomyLevel2;
};

export function getRequestTaxonomy(req: Request): Taxonomy {
  return {
    taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
    taxonomyLevel2: getTaxonomyLevel2(req),
  };
}

function getTaxonomyLevel2(req: Request) {
  let taxonomyLevel2 = TaxonomyLevel2.BLANK;

  if (isFeedbackTaxonomy(req)) {
    taxonomyLevel2 = TaxonomyLevel2.FEEDBACK;
    if (isGuidanceTaxonomy(req)) {
      taxonomyLevel2 = TaxonomyLevel2.GUIDANCE;
    }
  }

  return taxonomyLevel2;
}

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
