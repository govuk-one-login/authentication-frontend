import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { authCodeService } from "../auth-code-service";
import { SinonStub } from "sinon";
import { API_ENDPOINTS } from "../../../app.constants";
import { AuthCodeServiceInterface } from "../types";
import { Http } from "../../../utils/http";
import {
  support2FABeforePasswordReset,
  support2hrLockout,
} from "../../../config";

describe("authentication auth code service", () => {
  const redirectUriSentToAuth = "/redirect-uri";
  const rpSectorHostSentToAuth = "https://rp.redirect.uri";
  const isAccountCreationJourneyUserSession = true;
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
        rpSectorHost: rpSectorHostSentToAuth,
      };

      const userSessionClient = {
        isAccountCreationJourney: isAccountCreationJourneyUserSession,
      };

      const result = await service.getAuthCode(
        "sessionId",
        "clientSessionId",
        "sourceIp",
        "persistentSessionId",
        sessionClient,
        userSessionClient
      );

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
      expect(getStub.notCalled).to.be.true;
      expect(result.data.location).to.deep.eq(redirectUriReturnedFromResponse);
    });

    it("should make a request for an RP auth code following the prove identity callback page", async () => {
      process.env.SUPPORT_AUTH_ORCH_SPLIT = "1";

      const result = await service.getAuthCode(
        "sessionId",
        "clientSessionId",
        "sourceIp",
        "persistentSessionId",
        {},
        { authCodeReturnToRP: true }
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

  describe("with auth orch split feature flag off", () => {
    it("it should make a get request to the existing endpoint with no body", async () => {
      process.env.SUPPORT_AUTH_ORCH_SPLIT = "0";

      const result = await service.getAuthCode(
        "sessionId",
        "clientSessionId",
        "sourceIp",
        "persistentSessionId",
        {},
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

  describe("support2FABeforePasswordReset() with the support 2FA before password reset feature flag on", () => {
    it("should return true when SUPPORT_2FA_B4_PASSWORD_RESET is set to '1'", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";

      expect(support2FABeforePasswordReset()).to.be.true;
    });

    it("should return false  when SUPPORT_2FA_B4_PASSWORD_RESET is set to '0'", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "0";

      expect(support2FABeforePasswordReset()).to.be.false;
    });

    it("should return false when SUPPORT_2FA_B4_PASSWORD_RESET is undefined", async () => {
      process.env.SUPPORT_2FA_B4_PASSWORD_RESET = undefined;

      expect(support2FABeforePasswordReset()).to.be.false;
    });
  });

  describe("support2hrLockout() with the support 2hr lockout for password and code lockouts", () => {
    it("should return true when SUPPORT_2HR_LOCKOUT is set to '1'", async () => {
      process.env.SUPPORT_2HR_LOCKOUT = "1";

      expect(support2hrLockout()).to.be.true;
    });

    it("should return false  when SUPPORT_2HR_LOCKOUT is set to '0'", async () => {
      process.env.SUPPORT_2HR_LOCKOUT = "0";

      expect(support2hrLockout()).to.be.false;
    });

    it("should return false when SUPPORT_2HR_LOCKOUT is undefined", async () => {
      process.env.SUPPORT_2HR_LOCKOUT = undefined;

      expect(support2hrLockout()).to.be.false;
    });
  });
});
