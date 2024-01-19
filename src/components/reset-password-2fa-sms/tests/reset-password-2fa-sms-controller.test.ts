import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES } from "../../common/constants";
import {
  resetPassword2FASmsGet,
  resetPassword2FASmsPost,
} from "../reset-password-2fa-sms-controller";
import { VerifyCodeInterface } from "../../common/verify-code/types";
import { MfaServiceInterface } from "../../common/mfa/types";

describe("reset password 2fa auth app controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
    req = mockRequest({
      path: PATH_NAMES.RESET_PASSWORD_2FA_SMS,
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

  describe("resetPassword2FASmsGet", () => {
    it("should render reset password auth app view", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };

      await resetPassword2FASmsGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("reset-password-2fa-sms/index.njk");
    });
  });

  describe("resetPassword2FASmsPost", () => {
    it("should redirect to reset-password if code entered is correct and feature flag is turned on", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.session.user.enterEmailMfaType = "SMS";
      req.body.code = "123456";
      req.session.id = "123456-djjad";

      await resetPassword2FASmsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("should render check email page with errors if incorrect code entered", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.INVALID_MFA_CODE,
          },
        }),
      } as unknown as VerifyCodeInterface;
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.session.user.enterEmailMfaType = "SMS";
      req.body.code = "123456";
      req.session.id = "123456-djjad";

      await resetPassword2FASmsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("reset-password-2fa-sms/index.njk");
    });
  });
});
