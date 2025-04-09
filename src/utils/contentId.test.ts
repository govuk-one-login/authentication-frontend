import { getContentId } from "./contentId.js";
import { Request } from "express";
import { ContentIdFunction } from "../types.js";
import { expect } from "../../test/utils/test-utils.js";
const TEST_PATH_NAMES = {
  CUSTOM_FUNCTION: "/custom-function",
};

const CUSTOM_FUNCTION_ID = "this-is-a-custom-id";

const TEST_CONTENT_IDS: {
  [path: string]: ContentIdFunction;
} = {
  [TEST_PATH_NAMES.CUSTOM_FUNCTION]: () => CUSTOM_FUNCTION_ID,
};

describe("getContentId", () => {
  beforeEach(() => {
    process.env.SUPPORT_REAUTHENTICATION = "1";
  });

  it(`user on path with no associated contentIds returns empty string`, async () => {
    const contentId = getContentId(
      {
        path: "/undefined-path-with-no-content-id",
      } as Request,
      TEST_CONTENT_IDS
    );
    expect(contentId).to.eq("");
  });

  it(`when user is on path with contentId function it returns expected string`, async () => {
    const contentId = getContentId(
      {
        path: TEST_PATH_NAMES.CUSTOM_FUNCTION,
      } as Request,
      TEST_CONTENT_IDS
    );
    expect(contentId).to.eq(CUSTOM_FUNCTION_ID);
  });
});
