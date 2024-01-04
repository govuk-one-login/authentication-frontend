import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  enterPasswordGet,
  enterPasswordPost,
  enterSignInRetryBlockedGet,
  getErrorPathByCodeForPasswordFailures,
} from "../enter-password-controller";

import { PATH_NAMES } from "../../../app.constants";
import { EnterPasswordServiceInterface } from "../types";
import { MfaServiceInterface } from "../../common/mfa/types";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { EnterEmailServiceInterface } from "../../enter-email/types";
import { ERROR_CODES, getErrorPathByCode } from "../../common/constants";

describe("enter password controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.ENTER_PASSWORD,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("enterPasswordGet", () => {
    it("should render enter password view", () => {
      enterPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-password/index.njk");
    });
  });

  describe("enterPasswordPost", () => {
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

    it("should redirect to reset-password-required when the existing password is common and supportPasswordResetRequired() is enabled", async () => {
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

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.RESET_PASSWORD_REQUIRED
      );
      expect(req.session.user.isAccountPartCreated).to.be.eq(false);
      expect(fakeMfaService.sendMfaCode).not.to.have.been.called;
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

describe("getErrorPathByCodeForPasswordFailures", () => {
  it("should return PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED when passed ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES", () => {
    expect(
      getErrorPathByCodeForPasswordFailures(
        ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES
      )
    ).to.eq(PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED);
  });

  it("should otherwise return the same value as getErrorPathByCode would", () => {
    for (const [key, value] of Object.entries(ERROR_CODES)) {
      if (value !== ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES) {
        expect(getErrorPathByCodeForPasswordFailures(value)).to.eq(
          getErrorPathByCode(value),
          `Argument ${key} returned a different value`
        );
      }
    }
  });
});
