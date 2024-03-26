import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { OIDC_PROMPT, PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import {
  proveIdentityWelcomeGet,
  proveIdentityWelcomePost,
} from "../prove-identity-welcome-controller";

describe("prove your identity welcome controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const STATE = "ndhd7d7d";

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.PROVE_IDENTITY_WELCOME,
      session: {
        client: {
          redirectUri: "http://someservice.com/auth",
          state: STATE,
        },
        user: {},
      },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("proveIdentityWelcomeGet", () => {
    it("should render prove your identity welcome page", async () => {
      proveIdentityWelcomeGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith(
        "prove-identity-welcome/index.njk"
      );
    });

    it("should render prove identity welcome page for user that already has an active session", async () => {
      req.session.user.isAuthenticated = true;
      proveIdentityWelcomeGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith(
        "prove-identity-welcome/index-existing-session.njk"
      );
    });
  });

  describe("proveIdentityWelcomePost", () => {
    it("should redirect to sign in or create when user not authenticated", async () => {
      proveIdentityWelcomePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.SIGN_IN_OR_CREATE
      );
    });

    it("should redirect to prove your identity when user is authenticated", async () => {
      req.session.user.isAuthenticated = true;
      proveIdentityWelcomePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.PROVE_IDENTITY);
    });

    it("should redirect to uplift journey when user is required to step up auth", async () => {
      req.session.user.isAuthenticated = true;
      req.session.user.isUpliftRequired = true;
      proveIdentityWelcomePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.UPLIFT_JOURNEY);
    });

    it("should redirect to enter password when user is required to login (prompt=LOGIN)", async () => {
      req.session.user.isAuthenticated = true;
      req.session.client.prompt = OIDC_PROMPT.LOGIN;
      proveIdentityWelcomePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_PASSWORD);
    });
  });
});
