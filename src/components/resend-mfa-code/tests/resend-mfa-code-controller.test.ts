import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import {
  resendMfaCodeGet,
  resendMfaCodePost,
} from "../resend-mfa-code-controller.js";
import type { MfaServiceInterface } from "../../common/mfa/types.js";
import { PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

const TEST_REDACTED_PHONE_NUMBER = "1234";
const TEST_DEFAULT_MFA_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7";

describe("resend mfa controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHECK_YOUR_PHONE);
    res = mockResponse();

    req.session.user.activeMfaMethodId = TEST_DEFAULT_MFA_ID;
    req.session.user.mfaMethods = buildMfaMethods({
      id: TEST_DEFAULT_MFA_ID,
      redactedPhoneNumber: TEST_REDACTED_PHONE_NUMBER,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resendMfaCodeGet", () => {
    it("should render resend mfa code view", () => {
      resendMfaCodeGet(req as Request, res as Response);

      expect(res.render).to.have.calledWithMatch(
        "resend-mfa-code/index.njk",
        sinon.match({
          redactedPhoneNumber: TEST_REDACTED_PHONE_NUMBER,
        })
      );
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

    [
      {
        isSignInJourney: true,
        isAccountRecoveryJourney: false,
        expectedShow2HrScreen: true,
      },
      {
        isSignInJourney: false,
        isAccountRecoveryJourney: true,
        expectedShow2HrScreen: false,
      },
      {
        isSignInJourney: true,
        isAccountRecoveryJourney: true,
        expectedShow2HrScreen: false,
      },
    ].forEach((i) => {
      it(`should render correct lockout when isSignInJourney is ${i.isSignInJourney} and isAccountRecoveryJourney is ${i.isAccountRecoveryJourney}`, () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        req.session.user.wrongCodeEnteredLock = tomorrow.toUTCString();
        req.session.user.isSignInJourney = i.isSignInJourney;
        req.session.user.isAccountRecoveryJourney = i.isAccountRecoveryJourney;

        resendMfaCodeGet(req as Request, res as Response);

        expect(res.render).to.have.calledWithMatch(
          "security-code-error/index-security-code-entered-exceeded.njk",
          sinon.match({
            show2HrScreen: i.expectedShow2HrScreen,
          })
        );
      });
    });
  });

  describe("resendMfaCodePost", () => {
    it("should send mfa code and redirect to /enter-code view", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      req.session.user.email = "test@test.com";
      req.path = PATH_NAMES.RESEND_MFA_CODE;

      await resendMfaCodePost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_MFA);
      expect(fakeService.sendMfaCode).to.have.been.calledOnceWithExactly(
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        TEST_DEFAULT_MFA_ID,
        sinon.match.any
      );
    });
  });
});
