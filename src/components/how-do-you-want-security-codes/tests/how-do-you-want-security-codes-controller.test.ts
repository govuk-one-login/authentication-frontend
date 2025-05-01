import { describe } from "mocha";
import type { Request, Response } from "express";
import { expect } from "chai";
import { howDoYouWantSecurityCodesGet } from "../how-do-you-want-security-codes-controller.js";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { sinon } from "../../../../test/utils/test-utils.js";

describe("how do you want security codes controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("howDoYouWantSecurityCodesGet", () => {
    it("should render the how do you want security codes page", () => {
      howDoYouWantSecurityCodesGet(req as Request, res as Response);
      expect(res.render).to.have.calledWith(
        "how-do-you-want-security-codes/index.njk"
      );
    });
  });
});
