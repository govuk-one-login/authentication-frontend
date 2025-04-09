import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import { Request, Response } from "express";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../app.constants.js";
import {
  getSecurityCodesGet,
  getSecurityCodesPost,
} from "../select-mfa-options-controller.js";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("select-mfa-options controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.GET_SECURITY_CODES);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("getSecurityCodesGet", () => {
    it("should render get-security-codes page", () => {
      getSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("select-mfa-options/index.njk");
    });
  });

  describe("getSecurityCodesPost", async () => {
    it("should redirect to /enter-phone-number when text message selected", async () => {
      req.body.mfaOptions = "SMS";

      await getSecurityCodesPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER
      );
    });

    it("should redirect to /setup-authenticator-app even when auth app selected", async () => {
      req.body.mfaOptions = "AUTH_APP";

      await getSecurityCodesPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP
      );
    });

    describe("setting selectedMfaOption in the session", () => {
      [MFA_METHOD_TYPE.SMS, MFA_METHOD_TYPE.AUTH_APP].forEach((i) => {
        it(`req.session.user.selectedMfaOption should be set when req.body.mfaOptions is ${i}`, async () => {
          req.body.mfaOptions = i;

          await getSecurityCodesPost(req as Request, res as Response);

          expect(req.session.user).to.have.property("selectedMfaOption", i);
        });
      });
      it(`req.session.user.selectedMfaOption should not be set when req.body.mfaOptions is not a vaild value`, async () => {
        req.body.mfaOptions = "NOT_OK";

        await getSecurityCodesPost(req as Request, res as Response);

        expect(req.session.user).not.to.have.property("selectedMfaOption");
      });
    });
  });
});
