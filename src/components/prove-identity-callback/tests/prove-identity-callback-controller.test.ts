import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";

import { IPV_ERROR_CODES, OIDC_ERRORS, PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import {
  proveIdentityCallbackGetOrPost,
  proveIdentityStatusCallbackGet,
} from "../prove-identity-callback-controller.js";
import type { ProveIdentityCallbackServiceInterface } from "../types.js";
import { IdentityProcessingStatus } from "../types.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("prove identity callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  let next: sinon.SinonSpy;
  const STATE = "ndhd7d7d";

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.PROVE_IDENTITY_CALLBACK);
    req.session.user = { email: "test@test.com" };
    req.session.client = {
      rpRedirectUri: "http://rpservice.com/auth",
      name: "test service",
      rpState: STATE,
    };
    res = mockResponse();
    next = sinon.fake();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("proveIdentityCallbackGet", () => {
    it("should redirect to the RP when identity processing complete", async () => {
      const rpRedirectUrl = "https://rp.example.com?authcode=1234&state=teststate";
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns(
          Promise.resolve({
            success: true,
            data: { status: IdentityProcessingStatus.COMPLETED, code: 200, message: "" },
          })
        ),
        generateSuccessfulRpReturnUrl: sinon.fake.returns(Promise.resolve(rpRedirectUrl)),
      };
      await proveIdentityCallbackGetOrPost(fakeProveIdentityService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(rpRedirectUrl);
    });

    it("should render index when identity is being processed", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: { status: IdentityProcessingStatus.PROCESSING },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;

      await proveIdentityCallbackGetOrPost(fakeProveIdentityService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.been.calledWith("prove-identity-callback/index.njk");
    });

    describe("when the SUPPORT_NEW_IPV_SPINNER feature flag is enabled", () => {
      it("should use the index-new-spinner template when the feature flag is enabled", async () => {
        process.env.SUPPORT_NEW_IPV_SPINNER = "1";

        const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
          processIdentity: sinon.fake.returns({
            success: true,
            data: { status: IdentityProcessingStatus.PROCESSING },
          }),
        } as unknown as ProveIdentityCallbackServiceInterface;

        await proveIdentityCallbackGetOrPost(fakeProveIdentityService)(
          req as Request,
          res as Response
        );

        expect(res.render).to.have.been.calledWith(
          "prove-identity-callback/index-new-spinner.njk"
        );
      });
    });

    it("should redirect back to service when identity processing has errored", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: { status: IdentityProcessingStatus.ERROR },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;

      await proveIdentityCallbackGetOrPost(fakeProveIdentityService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(
        `http://rpservice.com/auth?error=${
          OIDC_ERRORS.ACCESS_DENIED
        }&error_description=${encodeURIComponent(
          IPV_ERROR_CODES.IDENTITY_PROCESSING_TIMEOUT
        )}&state=${encodeURIComponent(STATE)}`
      );
    });

    it("should redirect to the provided url when the response is an intervention", async () => {
      const redirectUrl = "https://www.example.com";
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: {
            status: IdentityProcessingStatus.INTERVENTION,
            redirectUrl: redirectUrl,
          },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;

      await proveIdentityCallbackGetOrPost(fakeProveIdentityService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(redirectUrl);
    });
  });

  describe("proveIdentityStatusCallbackGet", () => {
    it("should return status completed when identity processing complete", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: { status: IdentityProcessingStatus.COMPLETED },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;
      await proveIdentityStatusCallbackGet(fakeProveIdentityService)(
        req as Request,
        res as Response,
        next
      );

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        status: IdentityProcessingStatus.COMPLETED,
      });
    });
    it("should return status PROCESSING when identity processing is still PROCESSING", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: { status: IdentityProcessingStatus.PROCESSING },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;
      await proveIdentityStatusCallbackGet(fakeProveIdentityService)(
        req as Request,
        res as Response,
        next
      );

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        status: IdentityProcessingStatus.PROCESSING,
      });
    });
    it("should return status INTERVENTION when identity processing is INTERVENTION", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: { status: IdentityProcessingStatus.INTERVENTION },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;
      await proveIdentityStatusCallbackGet(fakeProveIdentityService)(
        req as Request,
        res as Response,
        next
      );

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        status: IdentityProcessingStatus.INTERVENTION,
      });
    });
    it("should return status ERROR when identity processing is in ERROR", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: { status: IdentityProcessingStatus.ERROR },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;
      await proveIdentityStatusCallbackGet(fakeProveIdentityService)(
        req as Request,
        res as Response,
        next
      );

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith({
        status: IdentityProcessingStatus.ERROR,
      });
    });
  });
});
