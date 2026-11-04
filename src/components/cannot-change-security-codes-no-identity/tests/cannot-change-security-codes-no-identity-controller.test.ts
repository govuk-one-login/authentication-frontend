import { expect } from "chai";
import { describe } from "mocha";
import type { Request, Response } from "express";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import sinon from "sinon";
import { strict as assert } from "assert";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import {
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import {
  cannotChangeSecurityCodesNoIdentityGet,
  cannotChangeSecurityCodesNoIdentityPost,
} from "../cannot-change-security-codes-no-identity-controller.js";

describe("cannot change security codes no identity controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(
      PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY
    );
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("cannotChangeSecurityCodesNoIdentityGet", () => {
    it("should render the cannot change security codes no identity template", () => {
      cannotChangeSecurityCodesNoIdentityGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledOnceWith(
        "cannot-change-security-codes-no-identity/index.njk"
      );
    });
  });

  describe("cannotChangeSecurityCodesNoIdentityPost", () => {
    it("should redirect to ssad authorize when the user cannot use their current method", async () => {
      req.body.cannotChangeHowGetSecurityCodeAction =
        CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.INITIATE_SELF_SERVE_ACCOUNT_DELETION;

      await cannotChangeSecurityCodesNoIdentityPost(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.SSAD_AUTHORIZE);
    });

    [
      {
        mfaMethodType: MFA_METHOD_TYPE.SMS,
        expectedPath: PATH_NAMES.ENTER_MFA,
      },
      {
        mfaMethodType: MFA_METHOD_TYPE.AUTH_APP,
        expectedPath: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
      },
    ].forEach(({ mfaMethodType, expectedPath }) => {
      it(`should redirect to ${expectedPath} when the user tries again and their MFA method is ${mfaMethodType}`, async () => {
        req.body.cannotChangeHowGetSecurityCodeAction =
          CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE;
        req.session.user.mfaMethodType = mfaMethodType;

        await cannotChangeSecurityCodesNoIdentityPost(
          req as Request,
          res as Response
        );

        expect(res.redirect).to.have.been.calledWith(expectedPath);
      });
    });

    it("should throw when the user tries again and has no MFA method", async () => {
      req.body.cannotChangeHowGetSecurityCodeAction =
        CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE;
      req.session.user.mfaMethodType = undefined;

      await assert.rejects(
        async () =>
          cannotChangeSecurityCodesNoIdentityPost(
            req as Request,
            res as Response
          ),
        { message: "Invalid mfaMethodType: undefined" }
      );
      expect(res.redirect).not.to.have.been.called;
    });

    it("should throw when the action is not one of this page's options", async () => {
      req.body.cannotChangeHowGetSecurityCodeAction =
        CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.HELP_DELETE_ACCOUNT;

      await assert.rejects(
        async () =>
          cannotChangeSecurityCodesNoIdentityPost(
            req as Request,
            res as Response
          ),
        {
          message: `Invalid cannotChangeHowGetSecurityCodeAction: ${CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.HELP_DELETE_ACCOUNT}`,
        }
      );
      expect(res.redirect).not.to.have.been.called;
    });
  });
});
