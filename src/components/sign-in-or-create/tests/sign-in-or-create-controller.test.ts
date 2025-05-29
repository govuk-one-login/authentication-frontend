import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import {
  signInOrCreateGet,
  signInOrCreatePost,
} from "../sign-in-or-create-controller.js";
import { PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("sign in or create controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.SIGN_IN_OR_CREATE);
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

    it("should render the mobile template when the channel is an app", async () => {
      res.locals.isApp = true;

      signInOrCreateGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("sign-in-or-create/index-mobile.njk");
    });
  });

  describe("signInOrCreatePost", () => {
    it("should redirect to enter email new create account", async () => {
      req.body.optionSelected = "create";

      await signInOrCreatePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT);
    });

    it("should redirect to enter email existing account", async () => {
      await signInOrCreatePost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
    });
  });
});
