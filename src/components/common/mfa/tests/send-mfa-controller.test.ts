import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import type { MfaServiceInterface } from "../types.js";
import { JOURNEY_TYPE, PATH_NAMES } from "../../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import * as journey from "../../journey/journey.js";
import { createMockRequest } from "../../../../../test/helpers/mock-request-helper.js";
import esmock from "esmock";
import type { SinonSpy } from "sinon";
import type { ExpressRouteFunc } from "../../../../types";

describe("send mfa controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  let getJourneyTypeFromUserSessionSpy: SinonSpy;
  let mockSendMfaGeneric: (
    mfaCodeService: MfaServiceInterface
  ) => ExpressRouteFunc;

  beforeEach(async () => {
    req = createMockRequest(PATH_NAMES.CHECK_YOUR_PHONE);
    res = mockResponse();

    getJourneyTypeFromUserSessionSpy = sinon.spy(
      journey.getJourneyTypeFromUserSession
    );

    ({ sendMfaGeneric: mockSendMfaGeneric } = await esmock(
      "../send-mfa-controller.js",
      {
        "../../journey/journey.js": {
          getJourneyTypeFromUserSession: getJourneyTypeFromUserSessionSpy,
        },
      }
    ));
  });

  afterEach(() => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
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

      await mockSendMfaGeneric(fakeService)(req as Request, res as Response);

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

  describe("Invalid MFA provided", () => {
    it("sign-in failed mfa check", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "0";
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: false,
          data: {
            code: 1042,
          },
        }),
      } as unknown as MfaServiceInterface;

      res.locals.sessionId = "123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };
      req.session.client = {
        redirectUri: "https://rp/",
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE;

      mockSendMfaGeneric(fakeService)(req as Request, res as Response);

      expect(
        getJourneyTypeFromUserSessionSpy
      ).to.have.been.calledOnceWithExactly(req.session.user, {
        includeReauthentication: true,
      });
      expect(getJourneyTypeFromUserSessionSpy.getCall(0).returnValue).to.be
        .undefined;
      expect(fakeService.sendMfaCode).to.have.been.calledOnceWithExactly(
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        undefined
      );
    });

    it("reauth failed mfa check", async () => {
      process.env.SUPPORT_REAUTHENTICATION = "1";
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: false,
          data: {
            code: 1042,
          },
        }),
      } as unknown as MfaServiceInterface;

      res.locals.sessionId = "123456-djjad";
      req.session.user = {
        email: "test@test.com",
        reauthenticate: "test_data",
      };
      req.session.client = {
        redirectUri: "https://rp/",
      };
      req.path = PATH_NAMES.RESEND_MFA_CODE;

      await mockSendMfaGeneric(fakeService)(req as Request, res as Response);

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
