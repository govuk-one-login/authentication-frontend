import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import {
  IPV_ERROR_CODES,
  OIDC_ERRORS,
  PATH_NAMES,
} from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { proveIdentityCallbackGet } from "../prove-identity-callback-controller";
import {
  IdentityProcessingStatus,
  ProveIdentityCallbackServiceInterface,
} from "../types";

describe("prove identity callback controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.PROVE_IDENTITY_CALLBACK,
      session: {
        client: {
          redirectUri: "http://someservice.com/auth",
          clientName: "test service",
        },
        user: { email: "test@test.com" },
      },
      log: { info: sinon.fake() },
    });
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
      };
      await proveIdentityCallbackGet(fakeProveIdentityService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should render index when identity is being processed ", async () => {
      const fakeProveIdentityService: ProveIdentityCallbackServiceInterface = {
        processIdentity: sinon.fake.returns({
          success: true,
          data: {
            status: IdentityProcessingStatus.PROCESSING,
          },
        }),
      };

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
      };

      await proveIdentityCallbackGet(fakeProveIdentityService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(
        `http://someservice.com/auth?error=${
          OIDC_ERRORS.ACCESS_DENIED
        }&error_description=${encodeURIComponent(
          IPV_ERROR_CODES.IDENTITY_PROCESSING_TIMEOUT
        )}`
      );
    });
  });
});
