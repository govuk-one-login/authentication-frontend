import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  enterPasswordGet,
  enterPasswordPost,
} from "../enter-password-controller";
import { UserSession } from "../../../types";
import { PATH_NAMES, USER_STATE } from "../../../app.constants";
import { EnterPasswordServiceInterface } from "../types";
import { MfaServiceInterface } from "../../common/mfa/types";

describe("enter password controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, session: { user: {} as UserSession } };
    res = { render: sandbox.fake(), redirect: sandbox.fake(), locals: {} };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("enterEmailGet", () => {
    it("should render enter email view", () => {
      enterPasswordGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("enter-password/index.njk");
    });
  });

  describe("enterPasswordPost", () => {
    it("should redirect to enter-code when the password is correct", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sandbox.fake.returns({
          sessionState: USER_STATE.LOGGED_IN,
          redactedPhoneNumber: "******3456",
          success: true,
        }),
      };

      const fakeMfaService: MfaServiceInterface = {
        sendMfaCode: sandbox.fake.returns({
          sessionState: "MFA_SMS_CODE_SENT",
          success: true,
        }),
      };

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
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
    });

    it("should redirect to auth code when mfa is not required", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sandbox.fake.returns({
          sessionState: USER_STATE.AUTHENTICATED,
          redactedPhoneNumber: "******3456",
        }),
      };

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await enterPasswordPost(false, fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should redirect to enter phone number when phone number is not verified", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sandbox.fake.returns({
          sessionState: USER_STATE.REQUIRES_TWO_FACTOR,
        }),
      };

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
      req.session.user = {
        email: "joe.bloggs@test.com",
      };
      req.body["password"] = "password";

      await enterPasswordPost(false, fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER
      );
    });

    it("should redirect to updated terms when terms and conditions not accepted", async () => {
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sandbox.fake.returns({
          sessionState: USER_STATE.UPDATED_TERMS_AND_CONDITIONS,
          success: true,
        }),
      };

      res.locals.sessionId = "123456-djjad";
      res.locals.clientSessionId = "00000-djjad";
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
    });

    it("should throw error when API call throws error", async () => {
      const error = new Error("Internal server error");
      const fakeService: EnterPasswordServiceInterface = {
        loginUser: sandbox.fake.throws(error),
      };

      const fakeMfaService: MfaServiceInterface = {
        sendMfaCode: sandbox.fake(),
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
});
