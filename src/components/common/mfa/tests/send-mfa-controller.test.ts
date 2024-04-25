import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { sendMfaGeneric } from "../send-mfa-controller";
import { MfaServiceInterface } from "../types";
import { JOURNEY_TYPE, PATH_NAMES } from "../../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import * as journey from "../../journey/journey";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper";

describe("send mfa controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHECK_YOUR_PHONE);
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

      const getJourneyTypeFromUserSessionSpy = sinon.spy(
        journey,
        "getJourneyTypeFromUserSession"
      );

      res.locals.sessionId = "123456-djjad";
      req.session.user = {
        email: "test@test.com",
        reauthenticate: "test_data",
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE;

      await sendMfaGeneric(fakeService)(req as Request, res as Response);

      expect(
        getJourneyTypeFromUserSessionSpy
      ).to.have.been.calledOnceWithExactly(req.session.user, {
        includeReauthentication: true,
      });
      expect(getJourneyTypeFromUserSessionSpy.getCall(0).returnValue).to.equal(
        JOURNEY_TYPE.REAUTHENTICATION
      );
      expect(fakeService.sendMfaCode).to.have.been.calledOnceWithExactly(
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
