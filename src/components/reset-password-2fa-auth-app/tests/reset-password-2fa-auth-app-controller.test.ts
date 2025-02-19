import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants";
import {
  resetPassword2FAAuthAppGet,
  resetPassword2FAAuthAppPost,
} from "../reset-password-2fa-auth-app-controller";
import { VerifyMfaCodeInterface } from "../../enter-authenticator-app-code/types";
import { ERROR_CODES } from "../../common/constants";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { commonVariables } from "../../../../test/helpers/common-test-variables";
import { getPermittedJourneyForPath } from "../../../utils/session";

describe("reset password 2fa auth app controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP);
    req.session.user = {
      journey: getPermittedJourneyForPath(
        PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP
      ),
      email: commonVariables.email,
    };
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("resetPassword2FAAuthAppGet", () => {
    it("should render reset password auth app view", async () => {
      await resetPassword2FAAuthAppGet()(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "reset-password-2fa-auth-app/index.njk"
      );
    });
  });

  describe("resetPassword2FAAuthAppPost", () => {
    it("should redirect to reset-password if code entered is correct", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as VerifyMfaCodeInterface;
      req.session.user.enterEmailMfaType = "AUTH-APP";
      req.body.code = "123456";

      await resetPassword2FAAuthAppPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.calledWith("/reset-password");
    });

    it("should render check email page with errors if incorrect code entered", async () => {
      const fakeService: VerifyMfaCodeInterface = {
        verifyMfaCode: sinon.fake.returns({
          success: false,
          data: {
            code: ERROR_CODES.AUTH_APP_INVALID_CODE,
          },
        }),
      } as unknown as VerifyMfaCodeInterface;
      req.session.user.enterEmailMfaType = "AUTH-APP";
      req.body.code = "123456";

      await resetPassword2FAAuthAppPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.calledWith(
        "reset-password-2fa-auth-app/index.njk"
      );
    });

    it("should render security-code-error/index-security-code-entered-exceeded.njk when user was locked out in the current session for requesting too many security codes", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      req.session.user.wrongCodeEnteredPasswordResetMfaLock =
        tomorrow.toUTCString();

      await resetPassword2FAAuthAppGet()(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "security-code-error/index-security-code-entered-exceeded.njk"
      );
    });
  });
});
