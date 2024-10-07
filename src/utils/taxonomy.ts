export enum TaxonomyLevel1 {
  BLANK = "",
  AUTHENTICATION = "authentication",
}

export enum TaxonomyLevel2 {
  BLANK = "",
}

export type Taxonomy = {
  taxonomyLevel1: TaxonomyLevel1;
  taxonomyLevel2: TaxonomyLevel2;
};

export function getRequestTaxonomy(): Taxonomy {
  return {
    taxonomyLevel1: TaxonomyLevel1.AUTHENTICATION,
    taxonomyLevel2: TaxonomyLevel2.BLANK,
  };
}
