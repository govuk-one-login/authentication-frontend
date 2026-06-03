import { describe } from "mocha";
import { expect } from "chai";
import type { Request, Response } from "express";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { cannotSignInPasskeyGet } from "../cannot-sign-in-passkey-controller.js";
import { sinon } from "../../../../test/utils/test-utils.js";

describe("cannot sign in passkey controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("cannotSignInPasskeyGet", () => {
    it("should render the cannot sign in passkey page", () => {
      cannotSignInPasskeyGet(req as Request, res as Response);
      expect(res.render).to.have.calledWith("cannot-sign-in-passkey/index.njk");
    });
  });
});
