import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { VerifyCodeInterface } from "../../common/verify-code/types";
import {
  checkYourEmailGet,
  checkYourEmailPost,
} from "../check-your-email-controller";
import { PATH_NAMES } from "../../../app.constants";
import { ERROR_CODES, getErrorPathByCode } from "../../common/constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("check your email controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CHECK_YOUR_EMAIL,
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

  describe("checkYourEmailGet", () => {
    it("should render the check your email view", () => {
      checkYourEmailGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith("check-your-email/index.njk");
    });

    it("should render security-code-error/index-wait.njk if user has been locked out in current session", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      req.session.user.codeRequestLock = tomorrow.toUTCString();
      checkYourEmailGet(req as Request, res as Response);
      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });
  });

  describe("checkYourEmailPost", () => {
    it("should redirect to /create-password when valid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;

      req.body.code = "123456";
      req.session.id = "123456-djjad";
      req.session.user.email = "test@test.com";

      await checkYourEmailPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD
      );
    });

    it("should redirect to /create-password when valid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;

      req.session.user.isVerifyEmailCodeResendRequired = true;

      await checkYourEmailPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.not.been.called;
      expect(res.redirect).to.have.calledWith(
        getErrorPathByCode(
          ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES
        )
      );
    });

    it("should return error when invalid code", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: false,
          data: { code: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE },
        }),
      } as unknown as VerifyCodeInterface;

      req.body.code = "678988";
      req.session.id = "123456-djjad";
      req.session.user.email = "test@test.com";

      await checkYourEmailPost(fakeService)(req as Request, res as Response);

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith("check-your-email/index.njk");
    });
  });
});
