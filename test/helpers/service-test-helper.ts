import type { ApiResponseResult } from "../../src/types.js";
import type { SinonStub } from "sinon";
import { expect } from "chai";
import { sinon } from "../utils/test-utils.js";
import { commonVariables } from "./common-test-variables.js";

export const expectedHeadersFromCommonVarsWithSecurityHeaders = {
  "X-API-Key": commonVariables.apiKey,
  "Session-Id": commonVariables.sessionId,
  "govuk-signin-journey-id": commonVariables.journeyId,
  "Client-Session-Id": commonVariables.journeyId,
  "x-forwarded-for": commonVariables.ip,
  "di-persistent-session-id": commonVariables.diPersistentSessionId,
  "txma-audit-encoded": commonVariables.auditEncodedString,
};

export const requestHeadersWithIpAndAuditEncoded = {
  "txma-audit-encoded": commonVariables.auditEncodedString,
  "x-forwarded-for": commonVariables.ip,
};

export interface StubCallExpectations {
  expectedPath: string;
  expectedHeaders: object;
  expectedBody: object;
  validateStatus?: boolean;
}

export function checkApiCallMadeWithExpectedBodyAndHeaders<T>(
  result: ApiResponseResult<T>,
  stub: SinonStub,
  expectedSuccess: boolean,
  expectations: StubCallExpectations
): void {
  expect(result.success).to.eq(expectedSuccess);

  const expectedValidateStatus = expectations.validateStatus
    ? { validateStatus: sinon.match.func }
    : {};

  expect(stub).to.be.calledOnceWithExactly(
    expectations.expectedPath,
    expectations.expectedBody,
    {
      headers: expectations.expectedHeaders,
      proxy: false,
      ...expectedValidateStatus,
    }
  );
}

export function setupApiKeyAndBaseUrlEnvVars(): void {
  process.env.API_KEY = commonVariables.apiKey;
  process.env.FRONTEND_API_BASE_URL = "https://example-base-url";
}

export function resetApiKeyAndBaseUrlEnvVars(): void {
  process.env.API_KEY = commonVariables.apiKey;
  process.env.FRONTEND_API_BASE_URL = "https://example-base-url";
  sinon.restore();
}
