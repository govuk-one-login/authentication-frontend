import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { VerifyCodeInterface } from "../../../common/verify-code/types";
import {
  checkYourEmailSecurityCodesGet,
  checkYourEmailSecurityCodesPost,
} from "../check-your-email-security-codes-controller";
import { PATH_NAMES } from "../../../../app.constants";
import { ERROR_CODES } from "../../../common/constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("check your email change security codes controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
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

  describe("checkYourEmailChangeSecurityCodesGet", () => {
    it("should render the check your email view", () => {
      checkYourEmailSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith(
        "account-recovery/check-your-email-security-codes/index.njk"
      );
    });
  });

  describe("checkYourEmailChangeSecurityCodesPost", () => {
    it("should redirect to /get-security-codes when valid code entered", async () => {
      const fakeService: VerifyCodeInterface = {
        verifyCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyCodeInterface;

      req.body.code = "123456";
      req.session.id = "123456-djjad";

      await checkYourEmailSecurityCodesPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.GET_SECURITY_CODES);
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

      await checkYourEmailSecurityCodesPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.verifyCode).to.have.been.calledOnce;
      expect(res.render).to.have.been.calledWith(
        "account-recovery/check-your-email-security-codes/index.njk"
      );
    });
  });
});
