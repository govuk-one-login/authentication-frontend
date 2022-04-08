import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { proveIdentityCallbackGet } from "../prove-identity-callback-controller";

describe("prove identity callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.PROVE_IDENTITY_CALLBACK,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("proveIdentityCallbackGet", () => {
    it("should redirect to auth code", () => {
      proveIdentityCallbackGet(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });
  });
});
