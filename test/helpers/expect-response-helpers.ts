import request from "supertest";
import { expect } from "../utils/test-utils";

export function expectAnalyticsPropertiesMatchSnapshot(
  res: request.Response
): void {
  if (res.statusCode < 300 || res.statusCode >= 400) {
    expect({
      taxonomyLevel1: res.text.match(/taxonomy_level1: '([\w\d\s]*)'/)?.[1],
      taxonomyLevel2: res.text.match(/taxonomy_level2: '([\w\d\s]*)'/)?.[1],
      contentId: res.text.match(/content_id: '([\w\d-]*)'/)?.[1],
    }).toMatchSnapshot();
  }
}