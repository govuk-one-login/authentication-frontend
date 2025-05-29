import { expect } from "chai";
import { describe } from "mocha";
import type { ConfigOptions } from "../../../src/utils/http.js";
import {
  getAdditionalAxiosConfig,
  getInternalRequestConfigWithSecurityHeaders,
} from "../../../src/utils/http.js";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../src/app.constants.js";
import { createMockRequest } from "../../helpers/mock-request-helper.js";
import * as headersLibrary from "@govuk-one-login/frontend-passthrough-headers";
import type { SinonSpy } from "sinon";
import sinon from "sinon";
import { commonVariables } from "../../helpers/common-test-variables.js";
import esmock from "esmock";
import type { Request } from "express";
import type { AxiosRequestConfig } from "axios";

describe("getInternalRequestConfigWithSecurityHeaders", () => {
  const req = createMockRequest(API_ENDPOINTS.START);
  const path = API_ENDPOINTS.START;
  const {
    apiKey,
    sessionId,
    clientSessionId,
    diPersistentSessionId,
    ip,
    auditEncodedString,
  } = commonVariables;

  beforeEach(() => {
    process.env.API_KEY = apiKey;
    process.env.FRONTEND_API_BASE_URL = "https://example.com";
  });

  afterEach(() => {
    delete process.env.API_KEY;
    delete process.env.FRONTEND_API_BASE_URL;
  });

  describe("headers", () => {
    let createPersonalDataHeadersSpy: SinonSpy;
    let mockGetInternalRequestConfigWithSecurityHeaders: (
      options: ConfigOptions,
      req: Request,
      path: string
    ) => AxiosRequestConfig;

    beforeEach(async () => {
      createPersonalDataHeadersSpy = sinon.spy(headersLibrary.createPersonalDataHeaders);

      ({
        getInternalRequestConfigWithSecurityHeaders:
          mockGetInternalRequestConfigWithSecurityHeaders,
      } = await esmock("../../../src/utils/http.js", {
        "@govuk-one-login/frontend-passthrough-headers": {
          createPersonalDataHeaders: createPersonalDataHeadersSpy,
        },
      }));
    });

    it("should set the route specific headers on a request", () => {
      const reauthenticate = true;
      const userLanguage = "cy";
      req.ip = ip;
      req.headers["x-forwarded-for"] = ip;
      const actualConfig = mockGetInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: diPersistentSessionId,
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
        "x-forwarded-for": ip,
        "di-persistent-session-id": diPersistentSessionId,
        Reauthenticate: reauthenticate,
        "User-Language": userLanguage,
      };

      expect(actualConfig.headers).to.deep.eq(expectedHeaders);
    });

    it("should set the security headers on all requests when added to the request in CloudFront", () => {
      const ipAddressFromCloudfrontHeader = "111.111.111.111";
      req.headers = {
        "txma-audit-encoded": auditEncodedString,
        "cloudfront-viewer-address": ipAddressFromCloudfrontHeader,
      };

      const actualConfig = mockGetInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
          clientSessionId: clientSessionId,
          persistentSessionId: diPersistentSessionId,
        },
        req,
        path
      );

      const expectedHeaders = {
        "X-API-Key": apiKey,
        "Session-Id": sessionId,
        "Client-Session-Id": clientSessionId,
        "x-forwarded-for": ipAddressFromCloudfrontHeader,
        "di-persistent-session-id": diPersistentSessionId,
        "txma-audit-encoded": auditEncodedString,
      };

      expect(actualConfig.headers).to.deep.eq(expectedHeaders);
      expect(createPersonalDataHeadersSpy.calledWith("https://example.com/start", req)).to
        .be.true;
    });

    it("should use the correct base path when calling create personal headers and the options contain a base path", () => {
      const ipAddressFromCloudfrontHeader = "111.111.111.111";
      req.headers = {
        "txma-audit-encoded": auditEncodedString,
        "cloudfront-viewer-address": ipAddressFromCloudfrontHeader,
      };

      const actualConfig = mockGetInternalRequestConfigWithSecurityHeaders(
        {
          baseURL: "https://some-other-base",
        },
        req,
        path
      );

      expect(
        createPersonalDataHeadersSpy.calledWith("https://some-other-base/start", req)
      ).to.be.true;

      const expectedHeaders = {
        "X-API-Key": apiKey,
        "txma-audit-encoded": auditEncodedString,
        "x-forwarded-for": ipAddressFromCloudfrontHeader,
      };

      expect(actualConfig.headers).to.deep.eq(expectedHeaders);
    });

    it("should handle errors from the frontend-passthrough-headers library", () => {
      const actualConfig = mockGetInternalRequestConfigWithSecurityHeaders(
        {},
        req,
        "bad path"
      );

      expect(actualConfig).to.not.be.undefined;
    });
  });

  it("should set the correct baseURL", () => {
    const overridingBaseURL = "https://www.example.com";

    const actualConfig = getInternalRequestConfigWithSecurityHeaders(
      {
        baseURL: overridingBaseURL,
      },
      req,
      path
    );

    expect(actualConfig.baseURL).to.eq(overridingBaseURL);
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
    expect(actualConfig.validateStatus(HTTP_STATUS_CODES.BAD_REQUEST)).to.eq(false);
  });
});

describe("getAdditionalAxiosConfig", () => {
  it("should return empty additional config when the http keep alive switch is off", () => {
    process.env.SUPPORT_HTTP_KEEP_ALIVE = "0";
    const additionalConfig = getAdditionalAxiosConfig();
    expect(additionalConfig).to.be.empty;
    delete process.env.SUPPORT_HTTP_KEEP_ALIVE;
  });

  it("should return an httpsAgent with keep alive when the http keep alive switch is on", () => {
    process.env.SUPPORT_HTTP_KEEP_ALIVE = "1";
    const additionalConfig = getAdditionalAxiosConfig();
    expect(additionalConfig.httpsAgent.keepAlive).to.eq(true);
    delete process.env.SUPPORT_HTTP_KEEP_ALIVE;
  });
});
