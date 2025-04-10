import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { permanentlyBlockedGet } from "../permanently-blocked-controller.js";
import { PATH_NAMES } from "../../../../app.constants.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
describe("permanently blocked controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.UNAVAILABLE_PERMANENT);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("blockedGet", () => {
    it("should render the account blocked view", () => {
      permanentlyBlockedGet(req, res);

      expect(res.render).to.have.calledWith(
        "account-intervention/permanently-blocked/index.njk"
      );
    });
  });
});
