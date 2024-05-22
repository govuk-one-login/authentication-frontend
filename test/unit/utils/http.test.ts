import { expect } from "chai";
import { describe } from "mocha";
import { getInternalRequestConfigWithSecurityHeaders } from "../../../src/utils/http";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../src/app.constants";
import { createMockRequest } from "../../helpers/mock-request-helper";
const headersLibrary = require("@govuk-one-login/frontend-passthrough-headers");
import sinon, { SinonSpy } from "sinon";

describe("getInternalRequestConfigWithSecurityHeaders", () => {
  const apiKey = "123";
  const req = createMockRequest(API_ENDPOINTS.START);
  const path = API_ENDPOINTS.START;

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

    beforeEach(() => {
      createPersonalDataHeadersSpy = sinon.spy(
        headersLibrary,
        "createPersonalDataHeaders"
      );
    });

    afterEach(() => {
      createPersonalDataHeadersSpy.restore();
    });

    it("should set the route specific headers on a request", () => {
      const sessionId = "someSessionId";
      const sourceIp = "123.123.123.123";
      const clientSessionId = "someClientSessionId";
      const persistentSessionId = "somePersistentSessionId";
      const reauthenticate = true;
      const userLanguage = "cy";
      req.ip = sourceIp;
      req.headers["x-forwarded-for"] = sourceIp;
      const actualConfig = getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
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
        "x-forwarded-for": sourceIp,
        "di-persistent-session-id": persistentSessionId,
        Reauthenticate: reauthenticate,
        "User-Language": userLanguage,
      };

      expect(actualConfig.headers).to.deep.eq(expectedHeaders);
    });

    it("should set the security headers on all requests when added to the request in CloudFront", () => {
      const ipAddressFromCloudfrontHeader = "111.111.111.111";
      req.headers = {
        "txma-audit-encoded": "foo",
        "cloudfront-viewer-address": ipAddressFromCloudfrontHeader,
      };

      const sessionId = "someSessionId";
      const clientSessionId = "someClientSessionId";
      const persistentSessionId = "somePersistentSessionId";
      const actualConfig = getInternalRequestConfigWithSecurityHeaders(
        {
          sessionId: sessionId,
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
      expect(
        createPersonalDataHeadersSpy.calledWith(
          "https://example.com/start",
          req
        )
      ).to.be.true;
    });

    it("should use the correct base path when calling create personal headers and the options contain a base path", () => {
      const ipAddressFromCloudfrontHeader = "111.111.111.111";
      req.headers = {
        "txma-audit-encoded": "foo",
        "cloudfront-viewer-address": ipAddressFromCloudfrontHeader,
      };

      const actualConfig = getInternalRequestConfigWithSecurityHeaders(
        {
          baseURL: "https://some-other-base",
        },
        req,
        path
      );

      expect(
        createPersonalDataHeadersSpy.calledWith(
          "https://some-other-base/start",
          req
        )
      ).to.be.true;

      const expectedHeaders = {
        "X-API-Key": apiKey,
        "txma-audit-encoded": "foo",
        "x-forwarded-for": ipAddressFromCloudfrontHeader,
      };

      expect(actualConfig.headers).to.deep.eq(expectedHeaders);
    });

    it("should handle errors from the frontend-passthrough-headers library", () => {
      const actualConfig = getInternalRequestConfigWithSecurityHeaders(
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
    expect(actualConfig.validateStatus(HTTP_STATUS_CODES.BAD_REQUEST)).to.eq(
      false
    );
  });
});
