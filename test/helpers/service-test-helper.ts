import { ApiResponseResult } from "../../src/types";
import { SinonStub } from "sinon";
import { expect } from "chai";
import { sinon } from "../utils/test-utils";

export const commonVariables = {
  email: "joe.bloggs@example.com",
  sessionId: "some-session-id",
  diPersistentSessionId: "some-persistent-session-id",
  clientSessionId: "some-client-session-id",
  ip: "123.123.123.123",
  apiKey: "apiKey",
};

export const expectedHeadersFromCommonVarsWithoutSecurityHeaders = {
  "X-API-Key": commonVariables.apiKey,
  "Session-Id": commonVariables.sessionId,
  "Client-Session-Id": commonVariables.clientSessionId,
  "X-Forwarded-For": commonVariables.ip,
  "di-persistent-session-id": commonVariables.diPersistentSessionId,
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

  expect(
    stub.calledOnceWithExactly(
      expectations.expectedPath,
      expectations.expectedBody,
      {
        headers: expectations.expectedHeaders,
        proxy: sinon.match.bool,
        ...expectedValidateStatus,
      }
    )
  ).to.be.true;
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
