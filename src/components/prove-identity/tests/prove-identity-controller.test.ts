import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { ProveIdentityServiceInterface } from "../types";
import { proveIdentityGet } from "../prove-identity-controller";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("prove identity controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("proveIdentityGet", () => {
    it("should redirect to IPV authorisation", async () => {
      const fakeService: ProveIdentityServiceInterface = {
        ipvAuthorize: sinon.fake.returns({
          success: true,
          data: { redirectUri: "https://test-ipv-authorisation-uri" },
        }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";

      await proveIdentityGet(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "https://test-ipv-authorisation-uri"
      );
    });
    it("should throw error when bad API request", async () => {
      const fakeService: ProveIdentityServiceInterface = {
        ipvAuthorize: sinon.fake.returns({
          success: false,
          data: { code: "1222", message: "Error occurred" },
        }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";

      await expect(
        proveIdentityGet(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith("1222:Error occurred");
    });
  });
});
