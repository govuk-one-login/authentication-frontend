import { expect } from "chai";
import { describe } from "mocha";
import type { NextFunction } from "express";
import { sinon } from "../../utils/test-utils.js";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { mockResponse } from "mock-req-res";
import { processIdentityRateLimitMiddleware } from "../../../src/middleware/process-identity-rate-limit-middleware.js";
import { addSecondsToDate } from "../../../src/utils/date.js";
import { createMockRequest } from "../../helpers/mock-request-helper.js";
describe("process identity rate limit middleware", () => {
  it("Should call next when first request", () => {
    const req = createMockRequest(PATH_NAMES.PROVE_IDENTITY_CALLBACK);
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;

    processIdentityRateLimitMiddleware(req, res, nextFunction);

    expect(res.redirect).to.not.have.been.called;
    expect(nextFunction).to.have.been.called;
  });

  it("Should call next when request is in time period", () => {
    const req = createMockRequest(PATH_NAMES.PROVE_IDENTITY_CALLBACK);
    req.session.user = { identityProcessCheckStart: addSecondsToDate(60) };
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;

    processIdentityRateLimitMiddleware(req, res, nextFunction);

    expect(res.redirect).to.not.have.been.called;
    expect(nextFunction).to.have.been.called;
  });

  it("Should call redirect to service when request is not time period", () => {
    const req = createMockRequest(PATH_NAMES.PROVE_IDENTITY_CALLBACK);
    req.session.user = { identityProcessCheckStart: addSecondsToDate(-60) };
    req.session.client = { redirectUri: "https://some-service.com/auth" };
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;

    processIdentityRateLimitMiddleware(req, res, nextFunction);

    expect(res.redirect).to.have.been.called;
    expect(nextFunction).to.not.have.been.called;
  });
});
