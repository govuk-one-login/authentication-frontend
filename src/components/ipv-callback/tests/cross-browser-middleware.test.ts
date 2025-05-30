import sinon from "sinon";
import { describe } from "mocha";
import type { Request } from "express";
import { expect } from "chai";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { crossBrowserMiddleware } from "../cross-browser-middleware.js";
import type { CrossBrowserService } from "../cross-browser-service.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
const expectedRedirect =
  "https://oidc.account.gov.uk/orchestration-redirect?state=7&error=access_denied&error_description=no_session";

const mockCrossBrowserService = (result: boolean) =>
  ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isCrossBrowserIssue: (_: Request) => result,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getOrchestrationRedirectUrl: (_: Request) =>
      Promise.resolve(expectedRedirect),
  }) as any as CrossBrowserService;

describe("CrossBrowserMiddleware", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  let next: sinon.SinonSpy;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.IPV_CALLBACK);
    res = mockResponse();
    next = sinon.spy();
  });

  it("should redirect to orch when cross browser", async () => {
    req.cookies = {};

    await crossBrowserMiddleware(mockCrossBrowserService(true))(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly(expectedRedirect);
  });

  it("should call next when no cookies are present but it is not cross browser", async () => {
    req.cookies = {};

    await crossBrowserMiddleware(mockCrossBrowserService(false))(
      req,
      res,
      next
    );

    expect(next).to.have.been.calledOnce;
  });

  it("should call next when cookies are present", async () => {
    const { sessionId, clientSessionId } = commonVariables;
    req.session.id = sessionId;
    req.cookies.gs = sessionId + clientSessionId;
    req.cookies.aps = sessionId;
    req.session.sessionRestored = true;

    await crossBrowserMiddleware(mockCrossBrowserService(true))(req, res, next);

    expect(next).to.have.been.calledOnce;
  });
});
