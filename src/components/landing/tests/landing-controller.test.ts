import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { landingGet } from "../landing-controller";
import { PATH_NAMES } from "../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

describe("landing controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ROOT);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("landingGet", () => {
    it("should redirect to /sign-in-or-create page when no existing session for user", async () => {
      await landingGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
    });
  });
});
