import { describe } from "mocha";
import { CrossBrowserService } from "../cross-browser-service.js";
import type { CrossBrowserRequest } from "../types.js";
import { expect } from "../../../../test/utils/test-utils.js";
import { Http } from "../../../utils/http.js";
import type { Request } from "express";
import type { SinonStub } from "sinon";
import sinon from "sinon";
import {
  expectedHeadersFromCommonVarsWithSecurityHeaders,
  requestHeadersWithIpAndAuditEncoded,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper.js";
import {
  createMockRequest,
  createMockResponse,
} from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { BadRequestError } from "../../../utils/error.js";
describe("CrossBrowserService", () => {
  const http = new Http();
  const underTest = new CrossBrowserService(http);
  let postStub: SinonStub;
  const orchestrationRedirectUrl =
    "https://oidc.test.account.gov.uk/orchestration-redirect?state=orchestration-state";
  const authenticationState = "authentication_state";
  const req: Request = createMockRequest(PATH_NAMES.IPV_CALLBACK, {
    headers: requestHeadersWithIpAndAuditEncoded,
    session: {},
  });
  const res = createMockResponse({ locals: {} });
  req.query = { error: "access_denied", state: authenticationState };
  const backendSuccessResponse = Promise.resolve({
    data: { orchestrationRedirectUrl },
    status: 200,
    statusText: "OK",
  });

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(http.client, "post");
  });
  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  describe("isCrossBrowserIssue", () => {
    it("should return true if request is cross Browser issue", () => {
      const result = underTest.isCrossBrowserIssue(req);
      expect(result).to.be.true;
    });

    it("should return false if the request does not have a state parameter", () => {
      const req: Request = createMockRequest(PATH_NAMES.IPV_CALLBACK, {
        headers: requestHeadersWithIpAndAuditEncoded,
      });
      req.query = { error: "access_denied" };
      const result = underTest.isCrossBrowserIssue(req);
      expect(result).to.be.false;
    });

    it("should return false if the request does not have an access denied error", () => {
      const req: Request = createMockRequest(PATH_NAMES.IPV_CALLBACK, {
        headers: requestHeadersWithIpAndAuditEncoded,
      });
      req.query = { error: "not_access_denied", state: authenticationState };
      const result = underTest.isCrossBrowserIssue(req);
      expect(result).to.be.false;
    });

    it("should return false if the request does not have query parameters", () => {
      const req: Request = createMockRequest(PATH_NAMES.IPV_CALLBACK, {
        headers: requestHeadersWithIpAndAuditEncoded,
      });
      const result = underTest.isCrossBrowserIssue(req);
      expect(result).to.be.false;
    });
  });

  describe("getOrchestrationRedirectUrl", () => {
    it("Returns the correct location", async () => {
      postStub.resolves(backendSuccessResponse);
      const result = await underTest.getOrchestrationRedirectUrl(
        req as CrossBrowserRequest,
        res
      );

      expect(result).to.eql(
        `${orchestrationRedirectUrl}&error=access_denied&error_description=no_session`
      );

      const expectedHeaders = {
        "X-API-Key":
          expectedHeadersFromCommonVarsWithSecurityHeaders["X-API-Key"],
        "x-forwarded-for":
          expectedHeadersFromCommonVarsWithSecurityHeaders["x-forwarded-for"],
        "txma-audit-encoded":
          expectedHeadersFromCommonVarsWithSecurityHeaders[
            "txma-audit-encoded"
          ],
      };
      expect(postStub).to.have.been.calledOnceWithExactly(
        "/id-reverification-state",
        { authenticationState: "authentication_state" },
        { headers: expectedHeaders, proxy: false }
      );
    });

    it("Throws an error if the backend 404s", async () => {
      const backendFailureResponse = Promise.resolve({
        data: "",
        status: 404,
        statusText: "Not found",
      });
      postStub.resolves(backendFailureResponse);
      let caughtError;
      try {
        await underTest.getOrchestrationRedirectUrl(
          req as CrossBrowserRequest,
          res
        );
      } catch (error) {
        caughtError = error;
      }
      expect(caughtError).to.exist; // Ensure an error was thrown
      expect(caughtError).to.be.an.instanceOf(BadRequestError);
      expect(caughtError.message).to.equal(
        "ID Reverification State request failed. Message: , code: 404"
      );
    });
  });
});
