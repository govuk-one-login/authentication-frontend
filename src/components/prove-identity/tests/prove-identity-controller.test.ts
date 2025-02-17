import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";

import { proveIdentityGet } from "../prove-identity-controller";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";
import { SinonStub } from "sinon";
import { AuthCodeServiceInterface } from "../../auth-code/types";
import { Http } from "../../../utils/http";
import { authCodeService } from "../../auth-code/auth-code-service";
import { ExpressRouteFunc } from "../../../types";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { getPermittedJourneyForPath } from "../../../utils/session";

describe("prove identity controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.PROVE_IDENTITY);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("proveIdentityGet", () => {
    const redirectUriSentToAuth = "/redirect-uri";
    const rpSectorHostSentToAuth = "https://rp.redirect.uri";
    const isAccountCreationJourneyUserSession = true;
    const passwordResetTimeTestVar = 1710335967;
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
      controller = proveIdentityGet(service);
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
      const claim = ["phone_number", "phone_number_verified"];
      const state = "state";
      req.session.client = {
        claim: claim,
        state: state,
        redirectUri: redirectUriSentToAuth,
        rpSectorHost: rpSectorHostSentToAuth,
      };

      req.session.user = {
        journey: getPermittedJourneyForPath(PATH_NAMES.PROVE_IDENTITY),
        isAccountCreationJourney: isAccountCreationJourneyUserSession,
        passwordResetTime: passwordResetTimeTestVar,
      };

      await controller(req as Request, res as Response);

      const expectedBody = {
        claims: claim,
        state: state,
        "redirect-uri": redirectUriSentToAuth,
        "rp-sector-uri": rpSectorHostSentToAuth,
        "is-new-account": isAccountCreationJourneyUserSession,
        "password-reset-time": passwordResetTimeTestVar,
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
