import { describe } from "mocha";
import { expect } from "chai";
import { Http } from "../../../utils/http.js";
import { sinon } from "../../../../test/utils/test-utils.js";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { SinonStub } from "sinon";
import { signInWithPasskeyService } from "../sign-in-with-passkey-service.js";
import type { SignInWithPasskeyInterface } from "../types.js";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";

describe("sign in with passkey service", () => {
  const httpInstance = new Http();
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  describe("startPasskeyAssertion", () => {
    const service: SignInWithPasskeyInterface =
      signInWithPasskeyService(httpInstance);

    it("should call the start passkey assertion API endpoint and return successful response", async () => {
      const req = createMockRequest(PATH_NAMES.SIGN_IN_WITH_PASSKEY, {
        headers: requestHeadersWithIpAndAuditEncoded,
      });
      const authenticationOptions = {
        challenge: "dGVzdC1jaGFsbGVuZ2U",
        rpId: "localhost",
        allowCredentials: [{ type: "public-key", id: "credential-id-123" }],
        timeout: 60000,
        userVerification: "preferred",
      };
      const axiosResponse = Promise.resolve({
        data: authenticationOptions,
        status: HTTP_STATUS_CODES.OK,
        success: true,
      });
      postStub.resolves(axiosResponse);

      const result = await service.startPasskeyAssertion(
        commonVariables.sessionId,
        commonVariables.clientSessionId,
        commonVariables.diPersistentSessionId,
        req
      );

      const expectedApiCallDetails = {
        expectedPath: API_ENDPOINTS.START_PASSKEY_ASSERTION,
        expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
        expectedBody: {},
      };
      checkApiCallMadeWithExpectedBodyAndHeaders(
        result,
        postStub,
        true,
        expectedApiCallDetails
      );
      expect(result.data).to.eq(authenticationOptions);
    });

    it("should return success false when the API returns non-200", async () => {
      const req = createMockRequest(PATH_NAMES.SIGN_IN_WITH_PASSKEY, {
        headers: requestHeadersWithIpAndAuditEncoded,
      });
      const axiosResponse = Promise.resolve({
        data: {
          message: "Failed to start assertion",
          code: 1000,
        },
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        success: false,
      });
      postStub.resolves(axiosResponse);

      const result = await service.startPasskeyAssertion(
        commonVariables.sessionId,
        commonVariables.clientSessionId,
        commonVariables.diPersistentSessionId,
        req
      );

      const expectedApiCallDetails = {
        expectedPath: API_ENDPOINTS.START_PASSKEY_ASSERTION,
        expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
        expectedBody: {},
      };
      checkApiCallMadeWithExpectedBodyAndHeaders(
        result,
        postStub,
        false,
        expectedApiCallDetails
      );
    });
  });

  describe("finishPasskeyAssertion", () => {
    const service: SignInWithPasskeyInterface =
      signInWithPasskeyService(httpInstance);

    it("should call the finish passkey assertion API endpoint and return successful response", async () => {
      const req = createMockRequest(PATH_NAMES.SIGN_IN_WITH_PASSKEY, {
        headers: requestHeadersWithIpAndAuditEncoded,
      });
      const startAuthenticationWebauthnResponse = {
        id: "localhost",
        response: "mock-response",
        type: "public-key",
      } as unknown as AuthenticationResponseJSON;
      const axiosResponse = Promise.resolve({
        data: {},
        status: HTTP_STATUS_CODES.OK,
        success: true,
      });
      postStub.resolves(axiosResponse);

      const result = await service.finishPasskeyAssertion(
        commonVariables.sessionId,
        commonVariables.clientSessionId,
        commonVariables.diPersistentSessionId,
        req,
        startAuthenticationWebauthnResponse
      );

      const expectedApiCallDetails = {
        expectedPath: API_ENDPOINTS.FINISH_PASSKEY_ASSERTION,
        expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
        expectedBody: { pkc: startAuthenticationWebauthnResponse },
      };
      checkApiCallMadeWithExpectedBodyAndHeaders(
        result,
        postStub,
        true,
        expectedApiCallDetails
      );
    });

    it("should return success false when the API returns non-200", async () => {
      const req = createMockRequest(PATH_NAMES.SIGN_IN_WITH_PASSKEY, {
        headers: requestHeadersWithIpAndAuditEncoded,
      });
      const startAuthenticationWebauthnResponse = {
        id: "localhost",
        response: "mock-response",
        type: "public-key",
      } as unknown as AuthenticationResponseJSON;
      const axiosResponse = Promise.resolve({
        data: {},
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        success: false,
      });
      postStub.resolves(axiosResponse);

      const result = await service.finishPasskeyAssertion(
        commonVariables.sessionId,
        commonVariables.clientSessionId,
        commonVariables.diPersistentSessionId,
        req,
        startAuthenticationWebauthnResponse
      );

      const expectedApiCallDetails = {
        expectedPath: API_ENDPOINTS.FINISH_PASSKEY_ASSERTION,
        expectedHeaders: expectedHeadersFromCommonVarsWithSecurityHeaders,
        expectedBody: { pkc: startAuthenticationWebauthnResponse },
      };
      checkApiCallMadeWithExpectedBodyAndHeaders(
        result,
        postStub,
        false,
        expectedApiCallDetails
      );
    });
  });
});
