import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { MFA_METHOD_TYPE, PATH_NAMES } from "../../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { SendNotificationServiceInterface } from "../../../common/send-notification/types";
import {
  changeSecurityCodesConfirmationGet,
  changeSecurityCodesConfirmationPost,
} from "../change-security-codes-confirmation-controller";

describe("change security codes confirmation controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("changeSecurityCodesConfirmationGet", () => {
    [MFA_METHOD_TYPE.SMS, MFA_METHOD_TYPE.AUTH_APP].forEach(function (
      mfaMethodType
    ) {
      it(`should render the change security codes codes confirmation page for mfaMethodType ${mfaMethodType}`, async () => {
        const fakeNotificationService: SendNotificationServiceInterface = {
          sendNotification: sinon.fake.returns({
            success: true,
          }),
        };
        req.query.type = mfaMethodType;
        req.session.user.email = "security.codes.changed@testtwofactorauth.org";
        req.session.user.redactedPhoneNumber = "*******1234";

        await changeSecurityCodesConfirmationGet(fakeNotificationService)(
          req as Request,
          res as Response
        );

        expect(res.render).to.have.been.calledWith(
          "account-recovery/change-security-codes-confirmation/index.njk",
          { mfaMethodType: mfaMethodType, phoneNumber: "*******1234" }
        );
      });
    });
  });

  describe("changeSecurityCodesConfirmationGetPost", () => {
    it("should redirect to auth code", () => {
      changeSecurityCodesConfirmationPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });
  });
});
