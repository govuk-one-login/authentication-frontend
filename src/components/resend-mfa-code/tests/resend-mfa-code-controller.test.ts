import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import { Request, Response } from "express";

import {
  resendMfaCodeGet,
  resendMfaCodePost,
} from "../resend-mfa-code-controller.js";
import { MfaServiceInterface } from "../../common/mfa/types.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("resend mfa controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHECK_YOUR_PHONE);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resendMfaCodeGet", () => {
    it("should render resend mfa code view", () => {
      resendMfaCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("resend-mfa-code/index.njk");
    });

    it("should render security-code-error/index-wait.njk if user has been locked out in current session", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      req.session.user.codeRequestLock = tomorrow.toUTCString();
      resendMfaCodeGet(req as Request, res as Response);
      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });
  });

  describe("resendMfaCodePost", () => {
    it("should send mfa code and redirect to /enter-code view", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      req.session.user = {
        email: "test@test.com",
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE;

      await resendMfaCodePost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_MFA);
      expect(fakeService.sendMfaCode).to.have.been.calledOnce;
    });
  });
});
