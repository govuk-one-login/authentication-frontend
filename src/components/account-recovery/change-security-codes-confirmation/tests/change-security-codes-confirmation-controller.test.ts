import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import {
  changeSecurityCodesConfirmationGet,
  changeSecurityCodesConfirmationPost,
} from "../change-security-codes-confirmation-controller";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";
import { buildMfaMethods } from "../../../../../test/helpers/mfa-helper";

describe("change security codes confirmation controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
  });

  describe("changeSecurityCodesConfirmationGet", () => {
    const redactedPhoneNumber = "*******1234";
    const testData = [
      {
        methodType: MFA_METHOD_TYPE.SMS,
        supportMfaResetWithIpv: false,
      },
      {
        methodType: MFA_METHOD_TYPE.AUTH_APP,
        supportMfaResetWithIpv: false,
      },
      {
        methodType: MFA_METHOD_TYPE.SMS,
        supportMfaResetWithIpv: true,
      },
      {
        methodType: MFA_METHOD_TYPE.AUTH_APP,
        supportMfaResetWithIpv: true,
      },
    ];
    testData.forEach(function (testParams) {
      it(`should render the change security codes codes confirmation page for mfaMethodType ${testParams.methodType}`, async () => {
        req.session.user.accountRecoveryVerifiedMfaType = testParams.methodType;
        req.session.user.email = "security.codes.changed@testtwofactorauth.org";
        req.session.user.mfaMethods = buildMfaMethods({ redactedPhoneNumber });
        if (testParams.supportMfaResetWithIpv) {
          process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";
        }

        await changeSecurityCodesConfirmationGet()(
          req as Request,
          res as Response
        );

        expect(res.render).to.have.been.calledWith(
          "account-recovery/change-security-codes-confirmation/index.njk",
          {
            mfaMethodType: testParams.methodType,
            phoneNumber: redactedPhoneNumber,
            supportMfaResetWithIpv: testParams.supportMfaResetWithIpv,
          }
        );
      });
    });
  });

  describe("changeSecurityCodesConfirmationPost", () => {
    it("should redirect to auth code after security codes confirmation ", async () => {
      req = createMockRequest(PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION);
      await changeSecurityCodesConfirmationPost(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });
  });
});
