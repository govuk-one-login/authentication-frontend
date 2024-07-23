import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  IPV_ERROR_CODES,
  OIDC_ERRORS,
  PATH_NAMES,
} from "../../../app.constants";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { proveIdentityCallbackGet } from "../prove-identity-callback-controller";
import {
  IdentityProcessingStatus,
  ProveIdentityCallbackServiceInterface,
} from "../types";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";

describe("prove identity callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

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
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("proveIdentityCallbackGet", () => {
    it("should redirect to auth code when identity processing complete", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: {
            status: IdentityProcessingStatus.COMPLETED,
          },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;
      await proveIdentityCallbackGet(fakeProveIdentityService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should render index when identity is being processed", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: {
            status: IdentityProcessingStatus.PROCESSING,
          },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;

      await proveIdentityCallbackGet(fakeProveIdentityService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.been.calledWith(
        "prove-identity-callback/index.njk"
      );
    });

    it("should redirect back to service when identity processing has errored", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: {
            status: IdentityProcessingStatus.ERROR,
          },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;

      await proveIdentityCallbackGet(fakeProveIdentityService)(
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

      await proveIdentityCallbackGet(fakeProveIdentityService)(
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
          data: {
            status: IdentityProcessingStatus.COMPLETED,
          },
        }),
      } as unknown as ProveIdentityCallbackServiceInterface;
      await proveIdentityCallbackGet(fakeProveIdentityService)(
        req as Request,
        res as Response
      );

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({
        status: IdentityProcessingStatus.COMPLETED,
      });
    });
  });
});
