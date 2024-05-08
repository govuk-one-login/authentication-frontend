import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  enterPasswordGet,
  enterPasswordPost,
  enterSignInRetryBlockedGet,
} from "../enter-password-controller";

import { JOURNEY_TYPE, PATH_NAMES } from "../../../app.constants";
import { EnterPasswordServiceInterface } from "../types";
import { MfaServiceInterface } from "../../common/mfa/types";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { EnterEmailServiceInterface } from "../../enter-email/types";
import { ERROR_CODES } from "../../common/constants";
import * as journey from "../../common/journey/journey";
import { accountInterventionsFakeHelper } from "../../../../test/helpers/account-interventions-helpers";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

describe("enter password controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ENTER_PASSWORD);
    res = mockResponse();
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
      it("should call the MFA service to send an code when required and able to", async () => {
        const fakeService: EnterPasswordServiceInterface = {
          loginUser: sinon.fake.returns({
            data: {
              redactedPhoneNumber: "3456",
              mfaRequired: true,
              consentRequired: false,
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

        res.locals.sessionId = "123456-djjad";
        res.locals.clientSessionId = "00000-djjad";
        res.locals.persistentSessionId = "dips-123456-abc";
        req.session.user = {
          email: "joe.bloggs@test.com",
        };
        req.body["password"] = "password";

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
              consentRequired: false,
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
          journey,
          "getJourneyTypeFromUserSession"
        );

        res.locals.sessionId = "123456-djjad";
        res.locals.clientSessionId = "00000-djjad";
        res.locals.persistentSessionId = "dips-123456-abc";
        req.session.user = {
          email: "joe.bloggs@test.com",
          reauthenticate: "test_data",
        };
        req.body["password"] = "password";

        await enterPasswordPost(
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
    });

    it("can send the journeyType when sending the password", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          data: {
            redactedPhoneNumber: "3456",
            mfaRequired: true,
            consentRequired: false,
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
        journey,
        "getJourneyTypeFromUserSession"
      );

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user = {
        email: "joe.bloggs@test.com",
        reauthenticate: "test_data",
      };
      req.body["password"] = "password";

      await enterPasswordPost(
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

    it("should redirect to enter-code when the password is correct", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          data: {
            redactedPhoneNumber: "3456",
            mfaRequired: true,
            consentRequired: false,
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

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await enterPasswordPost(
        false,
        fakeService,
        fakeMfaService
      )(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_MFA);
      expect(req.session.user.isAccountPartCreated).to.be.eq(false);
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

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

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

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

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

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

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

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await expect(
        enterPasswordPost(
          false,
          fakeService,
          fakeMfaService
        )(req as Request, res as Response)
      ).to.be.rejectedWith(Error, "Internal server error");
      expect(fakeService.loginUser).to.have.been.calledOnce;
    });

    it("should redirect to /reset-password-check-email when an account has any AIS status and an existing common password", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sinon.fake.returns({
          data: {
            redactedPhoneNumber: "3456",
            mfaRequired: true,
            consentRequired: false,
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
        res.locals.sessionId = "123456-djjad";
        res.locals.clientSessionId = "00000-djjad";
        res.locals.persistentSessionId = "dips-123456-abc";
        req.session.user = {
          email: "joe.bloggs@test.com",
        };
        req.body["password"] = "password";

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
    const SESSION_ID = "123456-djjad";
    const CLIENT_SESSION_ID = "00000-djjad";
    const PERSISTENT_SESSION_ID = "dips-123456-abc";
    const EMAIL = "joe.bloggs@test.com";

    it("should render /enter-password view when account is unblocked", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
        }),
      } as unknown as EnterEmailServiceInterface;

      res.locals.sessionId = SESSION_ID;
      res.locals.clientSessionId = CLIENT_SESSION_ID;
      res.locals.persistentSessionId = PERSISTENT_SESSION_ID;
      req.session.user = {
        email: EMAIL,
      };

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

      res.locals.sessionId = SESSION_ID;
      res.locals.clientSessionId = CLIENT_SESSION_ID;
      res.locals.persistentSessionId = PERSISTENT_SESSION_ID;
      req.session.user = {
        email: EMAIL,
      };

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
