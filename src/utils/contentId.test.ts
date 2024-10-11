import { getContentId } from "./contentId";
import { Request } from "express";
import { ContentIdVariants, UserSession } from "../types";
import { expect } from "../../test/utils/test-utils";

const TEST_PATH_NAMES = {
  JUST_DEFAULT: "/just-default",
  ALL_ASSOCIATED_IDS: "/all-associated-ids",
};

const TEST_CONTENT_IDS: {
  [path: string]: ContentIdVariants;
} = {
  [TEST_PATH_NAMES.JUST_DEFAULT]: {
    default: "this-is-a-default-content-id",
  },
  [TEST_PATH_NAMES.ALL_ASSOCIATED_IDS]: {
    default: "this-is-a-default-content-id",
    upliftRequired: "this-is-a-uplift-required-content-id",
  },
};

type VariantExpectation = {
  user?: Partial<UserSession>;
  path?: string;
  expectedContentId: string;
};

const TestUpliftRequiredUser: Partial<UserSession> = {
  isUpliftRequired: true,
};

const mappingsToTest: VariantExpectation[] = [
  { expectedContentId: "" },
  {
    path: TEST_PATH_NAMES.JUST_DEFAULT,
    expectedContentId: TEST_CONTENT_IDS[TEST_PATH_NAMES.JUST_DEFAULT].default,
  },
  {
    user: TestUpliftRequiredUser,
    path: TEST_PATH_NAMES.JUST_DEFAULT,
    expectedContentId: TEST_CONTENT_IDS[TEST_PATH_NAMES.JUST_DEFAULT].default,
  },
  {
    path: TEST_PATH_NAMES.ALL_ASSOCIATED_IDS,
    expectedContentId:
      TEST_CONTENT_IDS[TEST_PATH_NAMES.ALL_ASSOCIATED_IDS].default,
  },
  {
    user: TestUpliftRequiredUser,
    path: TEST_PATH_NAMES.ALL_ASSOCIATED_IDS,
    expectedContentId:
      TEST_CONTENT_IDS[TEST_PATH_NAMES.ALL_ASSOCIATED_IDS].upliftRequired,
  },
];

describe("getContentId", () => {
  it(`user on path with no associated contentIds returns empty string`, async () => {
    const contentId = getContentId(
      {
        path: "/undefined-path-with-no-content-id",
      } as Request,
      TEST_CONTENT_IDS
    );
    expect(contentId).to.eq("");
  });

  mappingsToTest.forEach((mapping) => {
    it(`user (${JSON.stringify(mapping.user)}) on path (${mapping.path}) should map to contentId ${JSON.stringify(mapping.expectedContentId)}`, async () => {
      const contentId = getContentId(
        {
          session: { user: mapping.user },
          path: mapping.path,
        } as Request,
        TEST_CONTENT_IDS
      );
      expect(contentId).to.eq(mapping.expectedContentId);
    });
  });
});
