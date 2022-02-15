import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  signInOrCreateGet,
  signInOrCreatePost,
} from "../sign-in-or-create-controller";
import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("sign in or create controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.SIGN_IN_OR_CREATE,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("signInOrCreateGet", () => {
    it("should render the sign in or create view", async () => {
      signInOrCreateGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("sign-in-or-create/index.njk");
    });
  });
  describe("signInOrCreatePost", () => {
    it("should redirect to enter email new create account", () => {
      req.body.optionSelected = "create";

      signInOrCreatePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT
      );
    });

    it("should redirect to enter email existing account", () => {
      signInOrCreatePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.ENTER_EMAIL_SIGN_IN
      );
    });
  });
});
