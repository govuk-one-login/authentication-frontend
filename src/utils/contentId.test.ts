import { getContentId } from "./contentId";
import { Request } from "express";
import { ContentId } from "../types";
import { expect } from "../../test/utils/test-utils";

const TEST_PATH_NAMES = {
  JUST_DEFAULT: "/just-default",
  CUSTOM_FUNCTION: "/custom-function",
};

const DEFAULT_ID = "this-is-a-default-content-id";
const CUSTOM_FUNCTION_ID = "this-is-a-custom-id";

const TEST_CONTENT_IDS: {
  [path: string]: ContentId;
} = {
  [TEST_PATH_NAMES.JUST_DEFAULT]: DEFAULT_ID,
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

  it(`when user is on path with contentId string it returns expected string`, async () => {
    const contentId = getContentId(
      {
        path: TEST_PATH_NAMES.JUST_DEFAULT,
      } as Request,
      TEST_CONTENT_IDS
    );
    expect(contentId).to.eq(DEFAULT_ID);
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
