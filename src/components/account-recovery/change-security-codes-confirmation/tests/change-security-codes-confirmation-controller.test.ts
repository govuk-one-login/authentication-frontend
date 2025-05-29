import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import {
  changeSecurityCodesConfirmationGet,
  changeSecurityCodesConfirmationPost,
} from "../change-security-codes-confirmation-controller.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
import { buildMfaMethods } from "../../../../../test/helpers/mfa-helper.js";

describe("change security codes confirmation controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("changeSecurityCodesConfirmationGet", () => {
    const redactedPhoneNumber = "*******1234";
    const testData = [
      { methodType: MFA_METHOD_TYPE.SMS },
      { methodType: MFA_METHOD_TYPE.AUTH_APP },
    ];
    testData.forEach(function (testParams) {
      it(`should render the change security codes codes confirmation page for mfaMethodType ${testParams.methodType}`, async () => {
        req.session.user.accountRecoveryVerifiedMfaType = testParams.methodType;
        req.session.user.email = "security.codes.changed@testtwofactorauth.org";
        req.session.user.mfaMethods = buildMfaMethods({ redactedPhoneNumber });

        await changeSecurityCodesConfirmationGet()(req as Request, res as Response);

        expect(res.render).to.have.been.calledWith(
          "account-recovery/change-security-codes-confirmation/index.njk",
          { mfaMethodType: testParams.methodType, phoneNumber: redactedPhoneNumber }
        );
      });
    });
  });

  describe("changeSecurityCodesConfirmationPost", () => {
    it("should redirect to auth code after security codes confirmation ", async () => {
      req = createMockRequest(PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION);
      await changeSecurityCodesConfirmationPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });
  });
});
