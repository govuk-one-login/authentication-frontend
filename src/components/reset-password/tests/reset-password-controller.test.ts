import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  resetPasswordGet,
  resetPasswordPost,
  resetPasswordRequestGet,
} from "../reset-password-controller";
import { ResetPasswordServiceInterface } from "../types";
import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("reset password controller (in 6 digit code flow)", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.RESET_PASSWORD,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
    res.locals.sessionId = "s-123456-djjad";
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resetPasswordRequestGet", () => {
    it("should redirect to /reset-password-check-mail when reset password requested", () => {

      req.path = PATH_NAMES.RESET_PASSWORD_REQUEST;

      resetPasswordRequestGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL);
    });
  });


  describe("resetPasswordGet", () => {
    it("should render change password page", () => {
      resetPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("reset-password/index.njk");
    });
  });

  describe("resetPasswordPost", () => {
    it("should redirect to /auth-code when password updated", async () => {
      const fakeService: ResetPasswordServiceInterface = {
        updatePassword: sinon.fake.returns({ success: true }),
      };

      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body.password = "Password1";

      await resetPasswordPost(fakeService)(req as Request, res as Response);

      expect(fakeService.updatePassword).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.AUTH_CODE
      );
    });
  });
});

