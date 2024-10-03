import request from "supertest";
import { expect } from "../utils/test-utils";

export function expectTaxonomyMatchSnapshot(res: request.Response): void {
  if (res.statusCode < 300 || res.statusCode >= 400) {
    expect({
      taxonomyLevel1: res.text.match(/taxonomy_level1: '(\w*)'/)?.[1],
      taxonomyLevel2: res.text.match(/taxonomy_level2: '(\w*)'/)?.[1],
    }).toMatchSnapshot();
  }
}
