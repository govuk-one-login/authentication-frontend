import { expect } from "chai";
import { describe } from "mocha";
import {
  getRequestConfig,
  getInternalRequestConfigWithSecurityHeaders,
} from "../../../src/utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../src/app.constants";
import { createMockRequest } from "../../helpers/mock-request-helper";

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

describe("getInternalRequestConfigWithSecurityHeaders", () => {
  const apiKey = "123";
  const req = createMockRequest(API_ENDPOINTS.START);
  const path = API_ENDPOINTS.START;

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
    const actualConfig = getInternalRequestConfigWithSecurityHeaders(
      {
        sessionId: sessionId,
        sourceIp: sourceIp,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
        reauthenticate: reauthenticate,
        userLanguage: userLanguage,
      },
      req,
      path
    );

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

  it("should set the relevant headers on a request when request contains common headers", () => {
    const ipAddressFromCloudfrontHeader = "111.111.111.111";
    req.headers = {
      "txma-audit-encoded": "foo",
      "cloudfront-viewer-address": ipAddressFromCloudfrontHeader,
    };

    process.env.FRONTEND_API_BASE_URL = "https://example.com";

    const sessionId = "someSessionId";
    const sourceIp = "123.123.123.123";
    const clientSessionId = "someClientSessionId";
    const persistentSessionId = "somePersistentSessionId";
    const actualConfig = getInternalRequestConfigWithSecurityHeaders(
      {
        sessionId: sessionId,
        sourceIp: sourceIp,
        clientSessionId: clientSessionId,
        persistentSessionId: persistentSessionId,
      },
      req,
      path
    );

    const expectedHeaders = {
      "X-API-Key": apiKey,
      "Session-Id": sessionId,
      "Client-Session-Id": clientSessionId,
      "x-forwarded-for": ipAddressFromCloudfrontHeader,
      "di-persistent-session-id": persistentSessionId,
      "txma-audit-encoded": "foo",
    };

    expect(actualConfig.headers).to.deep.eq(expectedHeaders);
  });

  it("should set the correct baseURL", () => {
    const baseURL = "https://www.example.com";

    const actualConfig = getInternalRequestConfigWithSecurityHeaders(
      {
        baseURL: baseURL,
      },
      req,
      path
    );

    expect(actualConfig.baseURL).to.eq(baseURL);
  });

  it("should set the relevant validation status function", () => {
    const validStatus = HTTP_STATUS_CODES.OK;

    const actualConfig = getInternalRequestConfigWithSecurityHeaders(
      {
        validationStatuses: [validStatus],
      },
      req,
      path
    );

    expect(actualConfig.validateStatus(validStatus)).to.eq(true);
    expect(actualConfig.validateStatus(HTTP_STATUS_CODES.BAD_REQUEST)).to.eq(
      false
    );
  });
});
