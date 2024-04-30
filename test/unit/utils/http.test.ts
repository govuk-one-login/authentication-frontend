import { expect } from "chai";
import { describe } from "mocha";
import { getRequestConfig } from "../../../src/utils/http";
import { HTTP_STATUS_CODES } from "../../../src/app.constants";

describe("getRequestConfig", () => {
  const apiKey = "123";

  beforeEach(() => {
    process.env.API_KEY = apiKey;
  });

  afterEach(() => {
    delete process.env.API_KEY;
  });

  it("should set the relevant headers on a request", () => {
    const sessionId = "someSessionId";
    const sourceIp = "123.123.123.123";
    const clientSessionId = "someClientSessionId";
    const persistentSessionId = "somePersistentSessionId";
    const reauthenticate = true;
    const userLanguage = "cy";
    const actualConfig = getRequestConfig({
      sessionId: sessionId,
      sourceIp: sourceIp,
      clientSessionId: clientSessionId,
      persistentSessionId: persistentSessionId,
      reauthenticate: reauthenticate,
      userLanguage: userLanguage,
    });

    const expectedHeaders = {
      "X-API-Key": apiKey,
      "Session-Id": sessionId,
      "Client-Session-Id": clientSessionId,
      "X-Forwarded-For": sourceIp,
      "di-persistent-session-id": persistentSessionId,
      Reauthenticate: reauthenticate,
      "User-Language": userLanguage,
    };

    expect(actualConfig.headers).to.deep.eq(expectedHeaders);
  });

  it("should set the correct baseURL", () => {
    const baseURL = "https://www.example.com";

    const actualConfig = getRequestConfig({
      baseURL: baseURL,
    });

    expect(actualConfig.baseURL).to.eq(baseURL);
  });

  it("should set the relevant validation status function", () => {
    const validStatus = HTTP_STATUS_CODES.OK;

    const actualConfig = getRequestConfig({
      validationStatuses: [validStatus],
    });

    expect(actualConfig.validateStatus(validStatus)).to.eq(true);
    expect(actualConfig.validateStatus(HTTP_STATUS_CODES.BAD_REQUEST)).to.eq(
      false
    );
  });
});
