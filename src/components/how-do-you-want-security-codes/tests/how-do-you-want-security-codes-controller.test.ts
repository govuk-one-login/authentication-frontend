import { describe } from "mocha";
import type { Request, Response } from "express";
import { expect } from "chai";
import {
  howDoYouWantSecurityCodesGet,
  howDoYouWantSecurityCodesPost,
} from "../how-do-you-want-security-codes-controller.js";
import { mockResponse } from "mock-req-res";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../app.constants.js";
import { sinon } from "../../../../test/utils/test-utils.js";
import { MfaMethodPriority } from "../../../types.js";
import type { MfaMethod } from "../../../types.js";

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
  });

  describe("howDoYouWantSecurityCodesPost", () => {
    it("SMS/SMS user should redirect to enter mfa page", async () => {
      const defaultId = "9b1deb4d-3b7d-4bad-9bdd-2b0d7a3a03d7";
      const backupId = "9a51c939-3a39-4a30-b388-9543e0f87e3b";

      req.session.user.mfaMethods = [
        {
          id: defaultId,
          type: MFA_METHOD_TYPE.SMS,
          priority: MfaMethodPriority.DEFAULT,
          phoneNumber: "+447700900456",
          redactedPhoneNumber: "456",
        },
        {
          id: backupId,
          type: MFA_METHOD_TYPE.SMS,
          priority: MfaMethodPriority.BACKUP,
          phoneNumber: "+447700900789",
          redactedPhoneNumber: "789",
        },
      ] as MfaMethod[];

      req.body["mfa-method-id"] = backupId;

      await howDoYouWantSecurityCodesPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_MFA);
      expect(req.session.user.activeMfaMethodId).to.equal(backupId);
    });
  });
});
