import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { sendMfaGeneric } from "../send-mfa-controller";
import { MfaServiceInterface } from "../types";
import { JOURNEY_TYPE, PATH_NAMES } from "../../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("send mfa controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CHECK_YOUR_PHONE,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("sendMfaGeneric", () => {
    it("can send the journeyType when requesting the code", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      res.locals.sessionId = "123456-djjad";
      req.session.user = {
        email: "test@test.com",
        reauthenticate: "test_data",
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE;

      await sendMfaGeneric(fakeService)(req as Request, res as Response);

      expect(fakeService.sendMfaCode).to.have.been.calledWith(
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
});
