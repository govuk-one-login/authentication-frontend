import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import {
  enterPasswordGet,
  enterPasswordPost,
  enterSignInRetryBlockedGet,
} from "../enter-password-controller.js";
import {
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { EnterPasswordServiceInterface } from "../types.js";
import type { MfaServiceInterface } from "../../common/mfa/types.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import type { EnterEmailServiceInterface } from "../../enter-email/types.js";
import { ERROR_CODES } from "../../common/constants.js";
import * as journey from "../../common/journey/journey.js";
import { accountInterventionsFakeHelper } from "../../../../test/helpers/account-interventions-helpers.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import { ReauthJourneyError } from "../../../utils/error.js";
import { strict as assert } from "assert";
import esmock from "esmock";
import type { MfaMethod } from "../../../types.js";
import { MfaMethodPriority } from "../../../types.js";

describe("enter password controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  const { email } = commonVariables;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ENTER_PASSWORD);
    res = mockResponse();
    req.session.user = { email };
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";
  });

  afterEach(() => {
    delete process.env.SUPPORT_ACCOUNT_INTERVENTIONS;
    sinon.restore();
  });

  describe("enterPasswordGet", () => {
    it("should render enter password view", async () => {
      enterPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-password/index.njk");
    });
  });

  describe("enterPasswordPost", () => {
    describe("sending MFA code", () => {
      beforeEach(() => {
        req.body["password"] = "password";
      });

      it("should call the MFA service to send an code when required and able to", async () => {
        const fakeService: EnterPasswordServiceInterface = {
          loginUser: sinon.fake.returns({
            data: {
              redactedPhoneNumber: "3456",
              mfaRequired: true,
              latestTermsAndConditionsAccepted: true,
              mfaMethodVerified: true,
              mfaMethodType: "SMS",
              passwordChangeRequired: false,
            },
            success: true,
          }),
        } as unknown as EnterPasswordServiceInterface;

        const fakeMfaService: MfaServiceInterface = {
          sendMfaCode: sinon.fake.returns({
            success: true,
          }),
        } as unknown as MfaServiceInterface;

        await enterPasswordPost(
          false,
          fakeService,
          fakeMfaService
        )(req as Request, res as Response);

        expect(fakeMfaService.sendMfaCode).to.have.been.called;
      });

      it("can send the journeyType when requesting the code", async () => {
        const fakeService: EnterPasswordServiceInterface = {
          loginUser: sinon.fake.returns({
            data: {
              redactedPhoneNumber: "3456",
              mfaRequired: true,
              latestTermsAndConditionsAccepted: true,
              mfaMethodVerified: true,
              mfaMethodType: "SMS",
              passwordChangeRequired: false,
            },
            success: true,
          }),
        } as unknown as EnterPasswordServiceInterface;

        const fakeMfaService: MfaServiceInterface = {
          sendMfaCode: sinon.fake.returns({
            success: true,
          }),
        } as unknown as MfaServiceInterface;

        const getJourneyTypeFromUserSessionSpy = sinon.spy(
          journey.getJourneyTypeFromUserSession
        );

        req.session.user = { email, reauthenticate: "test_data" };

        const { enterPasswordPost: mockEnterPasswordPost } = await esmock(
          "../enter-password-controller.js",
          {
            "../../common/journey/journey.js": {
              getJourneyTypeFromUserSession: getJourneyTypeFromUserSessionSpy,
            },
          }
        );

        await mockEnterPasswordPost(
          false,
          fakeService,
          fakeMfaService
        )(req as Request, res as Response);

        expect(
          getJourneyTypeFromUserSessionSpy
        ).to.have.been.calledOnceWithExactly(req.session.user, {
          includeReauthentication: true,
        });
        expect(
          getJourneyTypeFromUserSessionSpy.getCall(0).returnValue
        ).to.equal(JOURNEY_TYPE.REAUTHENTICATION);
        expect(fakeMfaService.sendMfaCode).to.have.been.calledOnceWithExactly(
          sinon.match.any,
          sinon.match.any,
          sinon.match.any,
          sinon.match.any,
          sinon.match.any,
          sinon.match.any,
          sinon.match.any,
          JOURNEY_TYPE.REAUTHENTICATION
        );
      });

      it("should redirect to error page when backend responds indicating session missing or invalid", async () => {
        const fakePasswordService: EnterPasswordServiceInterface = {
          loginUser: sinon.fake.returns({
            success: false,
            data: {
              code: ERROR_CODES.SESSION_ID_MISSING_OR_INVALID,
            },
          }),
        } as unknown as EnterPasswordServiceInterface;

        const fakeMfaService: MfaServiceInterface = {
          sendMfaCode: sinon.fake.returns({
            success: true,
          }),
        } as unknown as MfaServiceInterface;

        await enterPasswordPost(
          false,
          fakePasswordService,
          fakeMfaService
        )(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(PATH_NAMES.ERROR_PAGE);
      });
    });

    it("can send the journeyType when sending the password", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          data: {
            redactedPhoneNumber: "3456",
            mfaRequired: true,
            latestTermsAndConditionsAccepted: true,
            mfaMethodVerified: true,
            mfaMethodType: "SMS",
          },
          success: true,
        }),
      } as unknown as EnterPasswordServiceInterface;

      const fakeMfaService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      const getJourneyTypeFromUserSessionSpy = sinon.spy(
        journey.getJourneyTypeFromUserSession
      );

      req.session.user = { email, reauthenticate: "test_data" };

      const { enterPasswordPost: mockEnterPasswordPost } = await esmock(
        "../enter-password-controller.js",
        {
          "../../common/journey/journey.js": {
            getJourneyTypeFromUserSession: getJourneyTypeFromUserSessionSpy,
          },
        }
      );

      await mockEnterPasswordPost(
        false,
        fakeService,
        fakeMfaService
      )(req as Request, res as Response);

      expect(
        getJourneyTypeFromUserSessionSpy
      ).to.have.been.calledOnceWithExactly(req.session.user, {
        includeReauthentication: true,
      });
      expect(getJourneyTypeFromUserSessionSpy.getCall(0).returnValue).to.equal(
        JOURNEY_TYPE.REAUTHENTICATION
      );
      expect(fakeService.loginUser).to.have.calledWith(
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        JOURNEY_TYPE.REAUTHENTICATION
      );
    });

    it("should record mfaMethods in user session", async () => {
      const expectedMfaMethods: MfaMethod[] = [
        {
          id: "test-id",
          type: MFA_METHOD_TYPE.SMS,
          priority: MfaMethodPriority.DEFAULT,
          redactedPhoneNumber: "******123",
        },
      ];

      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          data: {
            redactedPhoneNumber: "3456",
            mfaRequired: true,
            latestTermsAndConditionsAccepted: true,
            mfaMethodVerified: true,
            mfaMethodType: "SMS",
            mfaMethods: expectedMfaMethods,
          },
          success: true,
        }),
      } as unknown as EnterPasswordServiceInterface;

      const fakeMfaService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      req.session.user = { email, reauthenticate: "test_data" };

      await enterPasswordPost(
        false,
        fakeService,
        fakeMfaService
      )(req as Request, res as Response);

      expect(req.session.user.mfaMethods).to.deep.equal(expectedMfaMethods);
    });

    describe("enter password when signing in", () => {
      const fakeMfaService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      it("should redirect to enter-code when the password is correct", async () => {
        const fakeService: EnterPasswordServiceInterface = {
          loginUser: sinon.fake.returns({
            data: {
              redactedPhoneNumber: "3456",
              mfaRequired: true,
              latestTermsAndConditionsAccepted: true,
              mfaMethodVerified: true,
              mfaMethodType: "SMS",
            },
            success: true,
          }),
        } as unknown as EnterPasswordServiceInterface;

        await enterPasswordPost(
          false,
          fakeService,
          fakeMfaService
        )(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_MFA);
        expect(req.session.user.isAccountPartCreated).to.be.eq(false);
      });

      it("should redirect to account locked page when max password attempts exceeded", async () => {
        const fakeService: EnterPasswordServiceInterface = {
          loginUser: sinon.fake.returns({
            data: {
              code: ERROR_CODES.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED,
            },
            success: false,
          }),
        } as unknown as EnterPasswordServiceInterface;

        await enterPasswordPost(
          false,
          fakeService,
          fakeMfaService
        )(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(PATH_NAMES.ACCOUNT_LOCKED);
      });
    });

    describe("enter password for re-authentication journey", () => {
      it("should redirect to enter-code when password is correct", async () => {
        req.session.user.reauthenticate = "subject";
        req.session.client.redirectUri = "https://rp.gov.uk/redirect";

        const fakeService: EnterPasswordServiceInterface = {
          loginUser: sinon.fake.returns({
            data: {
              redactedPhoneNumber: "3456",
              mfaRequired: true,
              latestTermsAndConditionsAccepted: true,
              mfaMethodVerified: true,
              mfaMethodType: "SMS",
            },
            success: true,
          }),
        } as unknown as EnterPasswordServiceInterface;

        const fakeMfaService: MfaServiceInterface = {
          sendMfaCode: sinon.fake.returns({
            success: true,
          }),
        } as unknown as MfaServiceInterface;

        await enterPasswordPost(
          false,
          fakeService,
          fakeMfaService
        )(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_MFA);
      });
      it("should redirect to orchestration with login required error when max password retries exceeded", async () => {
        req.session.user.reauthenticate = "subject";
        // req.session.client.redirectUri = "https://rp.gov.uk/redirect";

        const fakeService: EnterPasswordServiceInterface = {
          loginUser: sinon.fake.returns({
            data: {
              code: ERROR_CODES.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED,
            },
            success: false,
          }),
        } as unknown as EnterPasswordServiceInterface;

        const fakeMfaService: MfaServiceInterface = {
          sendMfaCode: sinon.fake.returns({
            success: true,
          }),
        } as unknown as MfaServiceInterface;

        try {
          await enterPasswordPost(
            false,
            fakeService,
            fakeMfaService
          )(req as Request, res as Response);
        } catch (err) {
          expect(err).to.be.an.instanceof(ReauthJourneyError);
          expect(err.message).to.eq(
            "Re-auth journey failed due to missing redirect uri in client session."
          );
        }

        expect(res.redirect).to.have.callCount(0);
      });
    });

    it("should redirect to auth code when mfa is not required", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          success: true,
          data: {
            redactedPhoneNumber: "3456",
            mfaRequired: false,
            mfaMethodVerified: true,
            mfaMethodType: "SMS",
          },
        }),
      } as unknown as EnterPasswordServiceInterface;

      await enterPasswordPost(false, fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
      expect(req.session.user.isAccountPartCreated).to.be.eq(false);
    });

    it("should redirect to get security codes page when 2fa method is not verified", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          success: true,
          data: {
            redactedPhoneNumber: "3456",
            mfaMethodVerified: false,
            mfaMethodType: "SMS",
          },
        }),
      } as unknown as EnterPasswordServiceInterface;

      await enterPasswordPost(false, fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.GET_SECURITY_CODES);
      expect(req.session.user.isAccountPartCreated).to.be.eq(true);
    });

    it("should redirect to updated terms when terms and conditions not accepted", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          data: {
            redactedPhoneNumber: "3456",
            latestTermsAndConditionsAccepted: false,
            mfaMethodVerified: true,
            mfaMethodType: "SMS",
          },
          success: true,
        }),
      } as unknown as EnterPasswordServiceInterface;

      await enterPasswordPost(false, fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS
      );
      expect(req.session.user.isAccountPartCreated).to.be.eq(false);
    });

    it("should throw error when API call throws error", async () => {
      const error = new Error("Internal server error");
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.throws(error),
      };

      const fakeMfaService: MfaServiceInterface = {
        sendMfaCode: sinon.fake(),
      };

      await assert.rejects(
        async () =>
          enterPasswordPost(
            false,
            fakeService,
            fakeMfaService
          )(req as Request, res as Response),
        Error,
        "Internal server error"
      );
      expect(fakeService.loginUser).to.have.been.calledOnce;
    });

    it("should redirect to /reset-password-check-email when an account has any AIS status and an existing common password", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          data: {
            redactedPhoneNumber: "3456",
            mfaRequired: true,
            latestTermsAndConditionsAccepted: true,
            mfaMethodVerified: true,
            mfaMethodType: "SMS",
            passwordChangeRequired: true,
          },
          success: true,
        }),
      } as unknown as EnterPasswordServiceInterface;

      const fakeMfaService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      const testCases = [
        {
          name: "account had blocked AIS status",
          interventions: {
            blocked: true,
            temporarilySuspended: false,
            passwordResetRequired: false,
          },
        },
        {
          name: "account has temporarilySuspended AIS status",
          interventions: {
            blocked: false,
            temporarilySuspended: true,
            passwordResetRequired: false,
          },
        },
        {
          name: "account has password reset required AIS status",
          interventions: {
            blocked: false,
            temporarilySuspended: true,
            passwordResetRequired: true,
          },
        },
      ];

      for (const testCase of testCases) {
        const fakeInterventionsService = accountInterventionsFakeHelper({
          passwordResetRequired: testCase.interventions.passwordResetRequired,
          blocked: testCase.interventions.blocked,
          temporarilySuspended: testCase.interventions.temporarilySuspended,
          reproveIdentity: false,
        });

        await enterPasswordPost(
          false,
          fakeService,
          fakeMfaService,
          fakeInterventionsService
        )(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL
        );
      }
    });
  });

  describe("enterSignInRetryBlockedGet", () => {
    it("should render /enter-password view when account is unblocked", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
        }),
      } as unknown as EnterEmailServiceInterface;

      await enterSignInRetryBlockedGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith("enter-password/index.njk");
    });

    it("should render /sign-in-retry-blocked page when account is locked", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.ACCOUNT_LOCKED,
          },
        }),
      } as unknown as EnterEmailServiceInterface;

      await enterSignInRetryBlockedGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "enter-password/index-sign-in-retry-blocked.njk"
      );
    });
  });
});
