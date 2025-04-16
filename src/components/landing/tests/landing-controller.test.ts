import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { NextFunction, Request, Response } from "express";

import { landingGet } from "../landing-controller";
import { PATH_NAMES } from "../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

describe("landing controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  let next: sinon.SinonSpy;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ROOT);
    res = mockResponse();
    next = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("landingGet", () => {
    it("should redirect to /sign-in-or-create page when no existing session for user", async () => {
      await landingGet(req as Request, res as Response, next as NextFunction);

      expect(res.redirect).not.to.have.calledWith(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(res.status).to.have.been.calledOnceWith(403);
      expect(next).to.have.been.calledOnce;
      expect(next.args[0][0]).to.be.an("error");
    });
  });
});
