import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import type { MfaServiceInterface } from "../../common/mfa/types.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { upliftJourneyGet } from "../uplift-journey-controller.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("uplift journey controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.UPLIFT_JOURNEY);
    req.session.user = { email: "test@test.com" };
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("upliftJourneyGet", () => {
    it("should send mfa code and redirect to /enter-code view", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({ success: true }),
      } as unknown as MfaServiceInterface;

      await upliftJourneyGet(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_MFA);
      expect(fakeService.sendMfaCode).to.have.been.calledOnce;
    });

    it("should send mfa code and redirect to /enter-code with _ga param", async () => {
      const fakeService: MfaServiceInterface = {
        sendMfaCode: sinon.fake.returns({ success: true }),
      } as unknown as MfaServiceInterface;

      req.query._ga = "123123.21321313.2388839";

      await upliftJourneyGet(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        `${PATH_NAMES.ENTER_MFA}?_ga=${req.query._ga}`
      );
      expect(fakeService.sendMfaCode).to.have.been.calledOnce;
    });
  });
});
