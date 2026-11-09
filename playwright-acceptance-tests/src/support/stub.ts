/**
 * Client for stubbing API responses from step definitions.
 *
 * The stub is a separate process, so steps configure it over HTTP. This client
 * hides that detail: a step calls `stub.setStartResponse(...)` and reads as
 * intent, not plumbing. Responses are reset before each scenario, and the stub
 * holds no defaults — each step stubs the responses it relies on.
 */

export interface StubResponse {
  status: number;
  body: unknown;
}

/** API calls whose responses can be stubbed. Mirrors StubbedApiResponses in the stub. */
type ApiCall =
  | "startResponse"
  | "loginResponse"
  | "userExistsResponse"
  | "signUpResponse"
  | "mfaResponse"
  | "verifyCodeResponse"
  | "verifyMfaCodeResponse"
  | "authenticationAuthCodeResponse"
  | "accountInterventionsResponse";

function stubUrl(): string {
  return process.env.API_STUB_URL || "http://api-stub:8080";
}

async function setResponse(
  call: ApiCall,
  response: StubResponse
): Promise<void> {
  const res = await fetch(`${stubUrl()}/test/responses/${call}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response),
  });
  if (!res.ok) {
    throw new Error(`Failed to stub ${call}: ${res.status}`);
  }
}

export const stub = {
  setStartResponse: (response: StubResponse): Promise<void> =>
    setResponse("startResponse", response),
  setUserExistsResponse: (response: StubResponse): Promise<void> =>
    setResponse("userExistsResponse", response),
  setCorrectPasswordResponse: (response: StubResponse): Promise<void> =>
    setResponse("loginResponse", response),
};
