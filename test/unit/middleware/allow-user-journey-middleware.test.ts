import { expect } from "chai";
import { describe } from "mocha";
import { NextFunction } from "express";
import { sinon } from "../../utils/test-utils";
import { allowUserJourneyMiddleware } from "../../../src/middleware/allow-user-journey-middleware";
import { PATH_NAMES } from "../../../src/app.constants";
import { mockRequest, mockResponse } from "mock-req-res";

describe("Allow user journey middleware", () => {
  it("Should call next when use journey is valid", () => {
    const req = mockRequest({
      path: PATH_NAMES.ENTER_MFA,
      session: { user: { journey: { nextPath: PATH_NAMES.ENTER_MFA } } },
    });
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;

    allowUserJourneyMiddleware(req, res, nextFunction);

    expect(res.redirect).to.not.have.been.called;
    expect(nextFunction).to.have.been.called;
  });

  it("Should call next when allowed optional path", () => {
    const req = mockRequest({
      path: PATH_NAMES.ENTER_MFA,
      session: { user: { journey: { nextPath: PATH_NAMES.ENTER_MFA } } },
    });
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;

    allowUserJourneyMiddleware(req, res, nextFunction);

    expect(res.redirect).to.not.have.been.called;
    expect(nextFunction).to.have.been.called;
  });

  it("Should redirect back to next path when invalid user journey", () => {
    const req = mockRequest({
      path: PATH_NAMES.ENTER_PASSWORD,
      session: {
        user: {
          journey: { nextPath: PATH_NAMES.ENTER_MFA, optionalPaths: [] },
        },
      },
      log: { warn: sinon.fake() },
    });
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;

    allowUserJourneyMiddleware(req, res, nextFunction);

    expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_MFA);
    expect(req.log.warn).to.have.been.called;
    expect(nextFunction).to.not.have.been.called;
  });
});
