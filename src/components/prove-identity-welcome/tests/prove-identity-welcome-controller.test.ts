import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { OIDC_PROMPT, PATH_NAMES } from "../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import {
  proveIdentityWelcomeGet,
  proveIdentityWelcomePost,
} from "../prove-identity-welcome-controller";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

describe("prove your identity welcome controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const STATE = "ndhd7d7d";

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.PROVE_IDENTITY_WELCOME);
    req.session.client = {
      redirectUri: "http://someservice.com/auth",
      state: STATE,
    };
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("proveIdentityWelcomeGet", () => {
    it("should redirect to sign-in-or-create from prove your identity welcome page when not enabled", async () => {
      proveIdentityWelcomeGet(req as Request, res as Response);
      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.SIGN_IN_OR_CREATE
      );
    });
  });
  describe("proveIdentityWelcomePost", () => {
    it("should redirect to sign in or create when user not authenticated", async () => {
      await proveIdentityWelcomePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.SIGN_IN_OR_CREATE
      );
    });

    it(`should redirect to prove your identity via ${PATH_NAMES.AUTH_CODE} when user is authenticated`, async () => {
      req.session.user.isAuthenticated = true;
      await proveIdentityWelcomePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should redirect to uplift journey when user is required to step up auth", async () => {
      req.session.user.isAuthenticated = true;
      req.session.user.isUpliftRequired = true;
      await proveIdentityWelcomePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.UPLIFT_JOURNEY);
    });

    it("should redirect to enter password when user is required to login (prompt=LOGIN)", async () => {
      req.session.user.isAuthenticated = true;
      req.session.client.prompt = OIDC_PROMPT.LOGIN;
      await proveIdentityWelcomePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_PASSWORD);
    });
  });
});
