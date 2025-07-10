import { describe } from "mocha";
import type { Request, Response } from "express";
import { expect } from "chai";
import { strict as assert } from "assert";
import {
  howDoYouWantSecurityCodesGet,
  howDoYouWantSecurityCodesPost,
} from "../how-do-you-want-security-codes-controller.js";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../app.constants.js";
import { sinon } from "../../../../test/utils/test-utils.js";
import { BadRequestError } from "../../../utils/error.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import { MfaMethodPriority } from "../../../types.js";
import type { MfaMethod } from "../../../types.js";
import type { MfaServiceInterface } from "../../common/mfa/types.js";

describe("how do you want security codes controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("howDoYouWantSecurityCodesGet", () => {
    it("should render the how do you want security codes page", () => {
      howDoYouWantSecurityCodesGet(req as Request, res as Response);
      expect(res.render).to.have.calledWith(
        "how-do-you-want-security-codes/index.njk"
      );
    });

    it("should render reset password auth app view with supportMfaReset false when completing a password reset journey", () => {
      req.session.user.isPasswordResetJourney = true;

      howDoYouWantSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "how-do-you-want-security-codes/index.njk",
        {
          mfaResetLink: PATH_NAMES.MFA_RESET_WITH_IPV,
          mfaMethods: [],
          supportMfaReset: false,
        }
      );
    });

    it("should render reset password auth app view with supportMfaReset true when not completing a password reset journey", () => {
      req.session.user.isPasswordResetJourney = false;

      howDoYouWantSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "how-do-you-want-security-codes/index.njk",
        {
          mfaResetLink: PATH_NAMES.MFA_RESET_WITH_IPV,
          mfaMethods: [],
          supportMfaReset: true,
        }
      );
    });
  });

  describe("howDoYouWantSecurityCodesPost", () => {
    const defaultId = "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7";
    const backupId = "9a51c939-3a39-4a30-b388-9543e0f87e3b";

    beforeEach(() => {
      req.session.user.activeMfaMethodId = defaultId;

      req.session.user.mfaMethods = [
        {
          id: defaultId,
          type: MFA_METHOD_TYPE.SMS,
          priority: MfaMethodPriority.DEFAULT,
          redactedPhoneNumber: "456",
        },
        {
          id: backupId,
          type: MFA_METHOD_TYPE.SMS,
          priority: MfaMethodPriority.BACKUP,
          redactedPhoneNumber: "789",
        },
      ] as MfaMethod[];
    });

    for (const mfaMethodId of [defaultId, backupId]) {
      it("SMS/SMS user should redirect to enter mfa page", async () => {
        const fakeMfaCodeService: MfaServiceInterface = {
          sendMfaCode: sinon.fake.returns({
            success: true,
          }),
        } as unknown as MfaServiceInterface;

        req.body["mfa-method-id"] = mfaMethodId;

        await howDoYouWantSecurityCodesPost(fakeMfaCodeService)(
          req as Request,
          res as Response
        );

        expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_MFA);
        expect(req.session.user.activeMfaMethodId).to.equal(mfaMethodId);
      });
    }

    it("should throw error if the user has no MFA methods", async () => {
      req.session.user.mfaMethods = [];

      await assert.rejects(
        async () => howDoYouWantSecurityCodesPost()(req, res),
        BadRequestError,
        "No MFA methods found"
      );
    });

    it("should redirect to /enter-authenticator-app-code if 'authenticator app' is selected", async () => {
      req.body["mfa-method-id"] = "testAuthApp";
      req.session.user.mfaMethods = buildMfaMethods([
        {
          id: "testPhone",
          redactedPhoneNumber: "07000000000",
        },
        { id: "testAuthApp", authApp: true },
      ]);

      await howDoYouWantSecurityCodesPost()(req, res);

      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
      );
    });

    it("should not call sendMfaCode if requested MFA method ID is in sentOtpMfaMethodIds on the user session", async () => {
      const fakeMfaCodeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      req.session.user.activeMfaMethodId = defaultId;
      req.body["mfa-method-id"] = backupId;
      req.session.user.sentOtpMfaMethodIds = [defaultId, backupId];
      req.session.user.mfaMethods = buildMfaMethods([
        {
          id: defaultId,
          redactedPhoneNumber: "07123456789",
        },
        {
          id: backupId,
          redactedPhoneNumber: "07987654321",
        },
      ]);

      await howDoYouWantSecurityCodesPost(fakeMfaCodeService)(
        req as Request,
        res as Response
      );

      expect(fakeMfaCodeService.sendMfaCode).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_MFA);
    });
  });
});
