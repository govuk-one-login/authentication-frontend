import { describe } from "mocha";
import type { Request, Response } from "express";
import { expect } from "chai";
import { CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION, MFA_METHOD_TYPE, PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import {
  cannotChangeSecurityCodesGet,
  cannotChangeSecurityCodesPost,
} from "../cannot-change-security-codes-controller.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { strict as assert } from "assert";

describe("cannot change security codes controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(
      PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES
    );
    res = mockResponse();
  });

  describe("cannotChangeSecurityCodeGet", () => {
    it("should render the correct template", () => {
      cannotChangeSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "cannot-change-security-codes/index.njk"
      );
    });

    it("should render with identityFailed true when path is CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL", () => {
      req.path = PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL;

      cannotChangeSecurityCodesGet(req as Request, res as Response);

      const renderCall = res.render.getCall(0);
      expect(renderCall.args[1].identityFailed).to.equal(true);
    });

    it("should render with identityFailed false when path is CANNOT_CHANGE_SECURITY_CODES", () => {
      req.path = PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES;

      cannotChangeSecurityCodesGet(req as Request, res as Response);

      const renderCall = res.render.getCall(0);
      expect(renderCall.args[1].identityFailed).to.equal(false);
    });

    it("should render with onlyDeleteAccount true when needsForcedMFAReset and isMfaRequired are true", () => {
      req.session.user = { needsForcedMFAReset: true, isMfaRequired: true };

      cannotChangeSecurityCodesGet(req as Request, res as Response);

      const renderCall = res.render.getCall(0);
      expect(renderCall.args[1].onlyDeleteAccount).to.equal(true);
    });

    it("should render with onlyDeleteAccount false when needsForcedMFAReset is false", () => {
      req.session.user = { needsForcedMFAReset: false };

      cannotChangeSecurityCodesGet(req as Request, res as Response);

      const renderCall = res.render.getCall(0);
      expect(renderCall.args[1].onlyDeleteAccount).to.equal(false);
    });

    it("should render with identityFailed false when path is CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY_DELETE", () => {
      req.path = PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY_DELETE;

      cannotChangeSecurityCodesGet(req as Request, res as Response);

      const renderCall = res.render.getCall(0);
      expect(renderCall.args[1].formPostPath).to.equal(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY_DELETE);
      expect(renderCall.args[1].identityFailed).to.equal(false);
    })
  });

  describe("cannotChangeSecurityCodePost", () => {
    it("should redirect to contactUsLinkUrl when help-to-delete-account selected", () => {
      const TEST_CONTACT_US_LINK_URL = "https://example.com/contact-us";
      res.locals.contactUsLinkUrl = TEST_CONTACT_US_LINK_URL;
      req.body.cannotChangeHowGetSecurityCodeAction = "help-to-delete-account";

      cannotChangeSecurityCodesPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(TEST_CONTACT_US_LINK_URL);
    });

    it("should redirect to enter sms mfa page when sms mfa user selects 'ry entering a security code again with the method you already have set up' radio button", async () => {
      req.path = PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES;
      req.body.cannotChangeHowGetSecurityCodeAction =
        CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE;
      req.session.user.mfaMethodType = MFA_METHOD_TYPE.SMS;

      await cannotChangeSecurityCodesPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.ENTER_MFA);
    });

    it("should redirect to enter auth app mfa page when auth app mfa user selects 'ry entering a security code again with the method you already have set up' radio button", async () => {
      req.path = PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES;
      req.body.cannotChangeHowGetSecurityCodeAction =
        CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE;
      req.session.user.mfaMethodType = MFA_METHOD_TYPE.AUTH_APP;

      await cannotChangeSecurityCodesPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
      );
    });

    it("should throw when the action is not one of this page's options", async () => {
      req.body.cannotChangeHowGetSecurityCodeAction = "not-a-real-option";

      await assert.rejects(
        async () =>
          cannotChangeSecurityCodesPost(req as Request, res as Response),
        {
          message:
            "Invalid cannotChangeHowGetSecurityCodeAction: not-a-real-option",
        }
      );
      expect(res.redirect).not.to.have.been.called;
    });
  });
})