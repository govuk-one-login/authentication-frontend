import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { authCodeService } from "../auth-code-service";
import { SinonStub } from "sinon";
import { API_ENDPOINTS } from "../../../app.constants";
import { AuthCodeServiceInterface } from "../types";
import { Http } from "../../../utils/http";

describe("authentication auth code service", () => {
  const redirectUriSentToAuth = "/redirect-uri";
  const redirectUriReturnedFromResponse =
    "/redirect-here?with-some-params=added-by-the-endpoint";
  const apiBaseUrl = "/base-url";
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
  let getStub: SinonStub;
  let postStub: SinonStub;
  let service: AuthCodeServiceInterface;

  beforeEach(() => {
    process.env.API_KEY = "api-key";
    process.env.FRONTEND_API_BASE_URL = frontendBaseUrl;
    process.env.API_BASE_URL = apiBaseUrl;
    const httpInstance = new Http();
    service = authCodeService(httpInstance);
    getStub = sinon.stub(httpInstance.client, "get");
    postStub = sinon.stub(httpInstance.client, "post");
    getStub.resolves(axiosResponse);
    postStub.resolves(axiosResponse);
  });

  afterEach(() => {
    getStub.reset();
    postStub.reset();
  });

  describe("with auth orch split feature flag on", () => {
    it("it should make a post request to the orch auth endpoint with claim, state and redirect uri in the body", async () => {
      process.env.SUPPORT_AUTH_ORCH_SPLIT = "1";

      const claim = ["phone_number", "phone_number_verified"];
      const state = "state";
      const sessionClient = {
        claim: claim,
        state: state,
        redirectUri: redirectUriSentToAuth,
      };

      const result = await service.getAuthCode(
        "sessionId",
        "clientSessionId",
        "sourceIp",
        "persistentSessionId",
        sessionClient
      );

      const expectedBody = {
        claim: claim,
        state: state,
        "redirect-uri": redirectUriSentToAuth,
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
      expect(getStub.notCalled).to.be.true;
      expect(result.data.location).to.deep.eq(redirectUriReturnedFromResponse);
    });
  });

  describe("with auth orch split feature flag off", () => {
    it("it should make a get request to the existing endpoint with no body", async () => {
      process.env.SUPPORT_AUTH_ORCH_SPLIT = "0";

      const result = await service.getAuthCode(
        "sessionId",
        "clientSessionId",
        "sourceIp",
        "persistentSessionId",
        {}
      );

      expect(
        getStub.calledOnceWithExactly(API_ENDPOINTS.AUTH_CODE, {
          headers: sinon.match.object,
          baseURL: apiBaseUrl,
          proxy: sinon.match.bool,
        })
      ).to.be.true;
      expect(postStub.notCalled).to.be.true;
      expect(result.data.location).to.deep.eq(redirectUriReturnedFromResponse);
    });
  });
});
