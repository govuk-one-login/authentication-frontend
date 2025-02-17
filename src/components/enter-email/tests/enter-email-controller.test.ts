import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  enterEmailCreateGet,
  enterEmailCreatePost,
  enterEmailGet,
  enterEmailPost,
} from "../enter-email-controller";
import { EnterEmailServiceInterface, LockoutInformation } from "../types";
import { JOURNEY_TYPE, ERROR_CODES } from "../../common/constants";
import { PATH_NAMES } from "../../../app.constants";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { CheckReauthServiceInterface } from "../../check-reauth-users/types";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { commonVariables } from "../../../../test/helpers/common-test-variables";
import { strict as assert } from "assert";
import { getPermittedJourneyForPath } from "../../../utils/session";

describe("enter email controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  let clock: sinon.SinonFakeTimers;
  const date = new Date(Date.UTC(2024, 1, 1));
  const { email } = commonVariables;

  const checkReauthSuccessfulFakeService: CheckReauthServiceInterface = {
    checkReauthUsers: sinon.fake.returns({
      success: true,
    }),
  } as unknown as CheckReauthServiceInterface;

  beforeEach(() => {
    res = mockResponse();
    clock = sinon.useFakeTimers({
      now: date.valueOf(),
    });
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  describe("enterEmailGet", () => {
    beforeEach(() => {
      req = createMockRequest(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_EMAIL_SIGN_IN),
        email,
      };
    });

    it("should render enter email create account view when user selected create account", () => {
      req.query.type = JOURNEY_TYPE.CREATE_ACCOUNT;

      enterEmailCreateGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "enter-email/index-create-account.njk"
      );
    });

    it("should render enter email view when supportReauthentication flag is switched off", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "0";

      await enterEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "enter-email/index-existing-account.njk"
      );
    });

    it("should render enter email view when isReautheticationRequired is false", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";

      await enterEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "enter-email/index-existing-account.njk"
      );
    });

    it("should render sign-in details entered too many times page view when reauthentication is required and user has been blocked from entering email", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";
      const date = new Date();
      const futureDate = new Date(
        date.setDate(date.getDate() + 6)
      ).toUTCString();

      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_EMAIL_SIGN_IN),
        email,
        reauthenticate: "1234",
        wrongEmailEnteredLock: futureDate,
      };

      await enterEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "enter-email/index-sign-in-details-entered-too-many-times.njk"
      );
    });

    it("should render enter password view when isReautheticationRequired is true and check service returns successfully", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";
      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_EMAIL_SIGN_IN),
        email,
        reauthenticate: "12345",
      };

      await enterEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "enter-email/index-re-enter-email-account.njk"
      );
    });
  });

  describe("enterEmailGet", () => {
    beforeEach(() => {
      req = createMockRequest(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
    });
    it("should render enter email create account view when user selected sign in", () => {
      enterEmailGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "enter-email/index-existing-account.njk"
      );
    });
  });

  describe("enterEmailPost", () => {
    beforeEach(() => {
      req = createMockRequest(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
      req.body.email = email;
    });
    it("should redirect to /enter-password when account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { doesUserExist: true },
        }),
      } as unknown as EnterEmailServiceInterface;

      await enterEmailPost(fakeService, checkReauthSuccessfulFakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.userExists).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_PASSWORD);
    });

    it("should redirect to /account-not-found when no account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { doesUserExist: false },
        }),
      } as unknown as EnterEmailServiceInterface;

      await enterEmailPost(fakeService, checkReauthSuccessfulFakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ACCOUNT_NOT_FOUND);
      expect(fakeService.userExists).to.have.been.calledOnce;
    });

    it("should set a lock with the correct timestamp when the response contains lockout information", async () => {
      const lockTTlInSeconds = 60;

      const lockoutInformation: LockoutInformation = {
        lockType: "codeBlock",
        lockTTL: lockTTlInSeconds.toString(),
        journeyType: "SIGN_IN",
        mfaMethodType: "SMS",
      };
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: {
            doesUserExist: true,
            lockoutInformation: [lockoutInformation],
          },
        }),
      } as unknown as EnterEmailServiceInterface;

      await enterEmailPost(fakeService, checkReauthSuccessfulFakeService)(
        req as Request,
        res as Response
      );

      const expectedLockTime = new Date(
        date.getTime() + lockTTlInSeconds * 1000
      ).toUTCString();

      expect(req.session.user.wrongCodeEnteredLock).to.eq(expectedLockTime);

      expect(res.redirect).to.have.calledWith("/enter-password");
      expect(fakeService.userExists).to.have.been.calledOnce;
    });

    it("should throw error when API call throws error", async () => {
      const error = new Error("Internal server error");
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.throws(error),
      };

      await assert.rejects(
        async () =>
          enterEmailPost(fakeService)(req as Request, res as Response),
        Error,
        "Internal server error"
      );
      expect(fakeService.userExists).to.have.been.calledOnce;
    });

    it("should throw error when session is not populated", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake(),
      };

      req.session.user = undefined;

      await assert.rejects(
        async () =>
          enterEmailPost(fakeService)(req as Request, res as Response),
        TypeError,
        "Cannot set properties of undefined (setting 'email')"
      );

      expect(fakeService.userExists).not.to.been.called;
    });

    it("should redirect to /account-locked when the account is locked", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.ACCOUNT_LOCKED,
          },
        }),
      } as unknown as EnterEmailServiceInterface;

      await enterEmailPost(fakeService)(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "enter-password/index-sign-in-retry-blocked.njk"
      );
      expect(fakeService.userExists).to.have.been.calledOnce;
    });

    it("should redirect to /enter-email when re-authentication is required and re-auth check is unsuccessful", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";

      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_EMAIL_SIGN_IN),
        email,
        reauthenticate: "12345",
      };

      req.t = sinon.fake.returns("translated string");

      const fakeUserExistsService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: false,
          data: { doesUserExist: false },
        }),
      } as unknown as EnterEmailServiceInterface;

      const fakeCheckReauthService: CheckReauthServiceInterface = {
        checkReauthUsers: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.RE_AUTH_CHECK_NO_USER_OR_NO_MATCH,
          },
        }),
      } as unknown as CheckReauthServiceInterface;

      await enterEmailPost(fakeUserExistsService, fakeCheckReauthService)(
        req as Request,
        res as Response
      );

      expect(fakeCheckReauthService.checkReauthUsers).to.have.been.calledOnce;
      expect(res.render).to.have.calledWith(
        "enter-email/index-re-enter-email-account.njk"
      );
    });

    it("should redirect to /enter-password blocked screen when the user has been blocked for entering max incorrect password during reauth journey", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";

      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_EMAIL_SIGN_IN),
        email,
        reauthenticate: "12345",
      };

      req.t = sinon.fake.returns("translated string");

      const fakeUserExistsService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: false,
          data: { doesUserExist: false },
        }),
      } as unknown as EnterEmailServiceInterface;

      const fakeCheckReauthService: CheckReauthServiceInterface = {
        checkReauthUsers: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.ACCOUNT_LOCKED,
          },
        }),
      } as unknown as CheckReauthServiceInterface;

      await enterEmailPost(fakeUserExistsService, fakeCheckReauthService)(
        req as Request,
        res as Response
      );

      expect(fakeCheckReauthService.checkReauthUsers).to.have.been.calledOnce;
      expect(res.render).to.have.calledWith(
        "enter-password/index-sign-in-retry-blocked.njk"
      );
    });

    it(
      "should redirect to the logout redirectUri in session when re-authentication is required and re-auth check is" +
        " unsuccessful",
      async () => {
        process.env.SUPPORT_REAUTHENTICATION = "1";

        req.session.user = {
          journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_EMAIL_SIGN_IN),
          email,
          reauthenticate: "12345",
        };

        req.session.client = {
          redirectUri: "https://example.com/redirect",
        };

        req.t = sinon.fake.returns("translated string");

        const fakeUserExistsService: EnterEmailServiceInterface = {
          userExists: sinon.fake.returns({
            success: false,
            data: { doesUserExist: false },
          }),
        } as unknown as EnterEmailServiceInterface;

        const fakeCheckReauthService: CheckReauthServiceInterface = {
          checkReauthUsers: sinon.fake.returns({
            success: false,
            data: {
              code: ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED,
            },
          }),
        } as unknown as CheckReauthServiceInterface;

        await enterEmailPost(fakeUserExistsService, fakeCheckReauthService)(
          req as Request,
          res as Response
        );

        expect(fakeCheckReauthService.checkReauthUsers).to.have.been.calledOnce;
        expect(res.redirect).to.have.been.calledWith(
          req.session.client.redirectUri.concat("?error=login_required")
        );
      }
    );

    it("should redirect to sign in details entered too many times when re-authentication is required and user is blocked from entering email", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";

      const date = new Date();
      const futureDate = new Date(
        date.setDate(date.getDate() + 6)
      ).toUTCString();

      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_EMAIL_SIGN_IN),
        email,
        reauthenticate: "758e657867",
        wrongEmailEnteredLock: futureDate,
      };

      req.t = sinon.fake.returns("translated string");

      const fakeUserExistsService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: false,
          data: { doesUserExist: false },
        }),
      } as unknown as EnterEmailServiceInterface;

      const fakeCheckReauthService: CheckReauthServiceInterface = {
        checkReauthUsers: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED,
          },
        }),
      } as unknown as CheckReauthServiceInterface;

      await enterEmailPost(fakeUserExistsService, fakeCheckReauthService)(
        req as Request,
        res as Response
      );

      expect(fakeCheckReauthService.checkReauthUsers).to.have.been.calledOnce;
      expect(res.render).to.have.calledWith(
        "enter-email/index-sign-in-details-entered-too-many-times.njk"
      );
    });

    it("should redirect to /enter-password re-auth page when re-authentication is required and service call is successful", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";
      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_EMAIL_SIGN_IN),
        email,
        reauthenticate: "12345",
      };

      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { doesUserExist: true },
        }),
      } as unknown as EnterEmailServiceInterface;

      await enterEmailPost(fakeService, checkReauthSuccessfulFakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_PASSWORD);
    });
  });

  describe("enterEmailCreatePost", () => {
    beforeEach(() => {
      req = createMockRequest(PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT);
      req.body.email = email;
    });

    it("should redirect to /enter-password when account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { doesUserExist: true },
        }),
      } as unknown as EnterEmailServiceInterface;

      await enterEmailCreatePost(fakeService)(req as Request, res as Response);

      expect(fakeService.userExists).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.ENTER_PASSWORD_ACCOUNT_EXISTS
      );
    });

    it("should redirect to /check-your-email when no account exists", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { userExists: false },
        }),
      } as unknown as EnterEmailServiceInterface;

      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SendNotificationServiceInterface;

      await enterEmailCreatePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.CHECK_YOUR_EMAIL);
      expect(fakeService.userExists).to.have.been.calledOnce;
    });

    it("should redirect to security-code-error/index-wait.njk when user requested too many email codes in previous account creation journey", async () => {
      const fakeService: EnterEmailServiceInterface = {
        userExists: sinon.fake.returns({
          success: true,
          data: { userExists: false },
        }),
      } as unknown as EnterEmailServiceInterface;

      const fakeNotificationService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.VERIFY_EMAIL_MAX_CODES_SENT,
          },
        }),
      } as unknown as SendNotificationServiceInterface;

      await enterEmailCreatePost(fakeService, fakeNotificationService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "security-code-error/index-wait.njk"
      );
    });
  });
});
