import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { ProveIdentityServiceInterface } from "../types";
import { proveIdentityGet } from "../prove-identity-controller";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";
import { SinonStub } from "sinon";
import { AuthCodeServiceInterface } from "../../auth-code/types";
import { Http } from "../../../utils/http";
import { authCodeService } from "../../auth-code/auth-code-service";
import { ExpressRouteFunc } from "../../../types";
import { proveIdentityService } from "../prove-identity-service";

describe("prove identity controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.PROVE_IDENTITY,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("proveIdentityGet", () => {
    it("should redirect to IPV authorisation", async () => {
      const fakeService: ProveIdentityServiceInterface = {
        ipvAuthorize: sinon.fake.returns({
          success: true,
          data: { redirectUri: "https://test-ipv-authorisation-uri" },
        }),
      } as unknown as ProveIdentityServiceInterface;

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";

      await proveIdentityGet(fakeService)(req as Request, res as Response);

      expect(req.session.user.journey.nextPath).to.equal(
        PATH_NAMES.PROVE_IDENTITY_CALLBACK
      );
      expect(res.redirect).to.have.calledWith(
        "https://test-ipv-authorisation-uri"
      );
    });
    it("should throw error when bad API request", async () => {
      const fakeService: ProveIdentityServiceInterface = {
        ipvAuthorize: sinon.fake.returns({
          success: false,
          data: { code: "1222", message: "Error occurred" },
        }),
      } as unknown as ProveIdentityServiceInterface;

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";

      await expect(
        proveIdentityGet(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith("1222:Error occurred");
    });
  });

  describe("with auth orch split feature flag on", () => {
    const redirectUriSentToAuth = "/redirect-uri";
    const rpSectorHostSentToAuth = "https://rp.redirect.uri";
    const isAccountCreationJourneyUserSession = true;
    const redirectUriReturnedFromResponse =
      "/redirect-here?with-some-params=added-by-the-endpoint";
    const frontendBaseUrl = "/frontend-base-url";

    const axiosResponse = Promise.resolve({
      data: {
        location: redirectUriReturnedFromResponse,
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    let postStub: SinonStub;
    let service: AuthCodeServiceInterface;
    let controller: ExpressRouteFunc;

    beforeEach(() => {
      process.env.API_KEY = "api-key";
      process.env.FRONTEND_API_BASE_URL = frontendBaseUrl;
      const httpInstance = new Http();
      service = authCodeService(httpInstance);
      controller = proveIdentityGet(proveIdentityService(), service);
      postStub = sinon.stub(httpInstance.client, "post");
      postStub.resolves(axiosResponse);
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
    });

    afterEach(() => {
      postStub.reset();
    });

    it("it should make a post request to the orch auth endpoint with claim, state and redirect uri in the body", async () => {
      process.env.SUPPORT_AUTH_ORCH_SPLIT = "1";

      const claim = ["phone_number", "phone_number_verified"];
      const state = "state";
      req.session.client = {
        claim: claim,
        state: state,
        redirectUri: redirectUriSentToAuth,
        rpSectorHost: rpSectorHostSentToAuth,
      };

      req.session.user = {
        isAccountCreationJourney: isAccountCreationJourneyUserSession,
      };

      await controller(req as Request, res as Response);

      const expectedBody = {
        claims: claim,
        state: state,
        "redirect-uri": redirectUriSentToAuth,
        "rp-sector-uri": rpSectorHostSentToAuth,
        "is-new-account": isAccountCreationJourneyUserSession,
      };

      expect(
        postStub.calledOnceWithExactly(
          API_ENDPOINTS.ORCH_AUTH_CODE,
          expectedBody,
          {
            headers: sinon.match.object,
            proxy: sinon.match.bool,
            baseURL: frontendBaseUrl,
          }
        )
      ).to.be.true;
    });
  });
});
