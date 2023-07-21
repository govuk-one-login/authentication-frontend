import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { MfaServiceInterface } from "../../common/mfa/types";
import { PATH_NAMES } from "../../../app.constants";
import { upliftJourneyGet } from "../uplift-journey-controller";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("uplift journey controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
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

  describe("upliftJourneyGet", () => {
    it("should send mfa code and redirect to /enter-code view", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      res.locals.sessionId = "123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };
      req.path = PATH_NAMES.UPLIFT_JOURNEY;

      await upliftJourneyGet(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_MFA);
      expect(fakeService.sendMfaCode).to.have.been.calledOnce;
    });

    it("should send mfa code and redirect to /enter-code with _ga param", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({
          success: true,
        }),
      } as unknown as MfaServiceInterface;

      req.query._ga = "123123.21321313.2388839";
      res.locals.sessionId = "123456-djjad";
      req.session.user = {
        email: "test@test.com",
      };
      req.path = PATH_NAMES.UPLIFT_JOURNEY;

      await upliftJourneyGet(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        `${PATH_NAMES.ENTER_MFA}?_ga=${req.query._ga}`
      );
      expect(fakeService.sendMfaCode).to.have.been.calledOnce;
    });
  });
});
