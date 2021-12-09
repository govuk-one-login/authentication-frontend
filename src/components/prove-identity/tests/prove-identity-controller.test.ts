import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { ProveIdentityServiceInterface } from "../types"
import { proveIdentityGet } from "../prove-identity-controller"

describe("prove identity controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: {} };
    res = { render: sandbox.fake(), redirect: sandbox.fake(), locals: {} };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("proveIdentityGet", () => {
    it("should redirect to IPV authorisation", async () => {
      const fakeService: ProveIdentityServiceInterface = {
        ipvAuthorize: sandbox.fake.returns({
          success: true,
          sessionState: "IPV_REQUIRED",
          redirectUri: "https://test-ipv-authorisation-uri",
        }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";

      await proveIdentityGet(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("https://test-ipv-authorisation-uri");
    });
  });
});
