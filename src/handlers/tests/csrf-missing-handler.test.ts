import { expect } from "chai";
import type { NextFunction, Request, Response } from "express";
import sinon from "sinon";
import { CSRF_MISSING_CODE, HTTP_STATUS_CODES } from "../../app.constants.js";
import { csrfMissingHandler } from "../csrf-missing-handler.js";
import { createMockRequest } from "../../../test/helpers/mock-request-helper.js";
describe("csrfMissingHandler", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = createMockRequest("/", {
      session: {
        id: "session-id",
        sessionRestored: true,
      },
      cookies: {
        gs: "gs-cookie",
        aps: "aps-cookie",
      },
    });
    res = {
      headersSent: false,
      statusCode: 200,
      render: () => {},
      status: function (newStatus: number) {
        this.statusCode = newStatus;
        return this;
      },
      send: sinon.spy(),
      locals: {
        strategicAppChannel: false,
      },
    } as unknown as Response;
    next = sinon.spy();
  });

  it("should render 500 template if the error is a csrf missing error and the session is valid", () => {
    const err = new Error("Invalid CSRF token") as any;
    err.code = CSRF_MISSING_CODE;

    const renderSpy = sinon.spy(res, "render");
    const expectedTemplate = "common/errors/500.njk";

    csrfMissingHandler(err, req, res, next);

    expect(renderSpy).to.have.been.calledOnceWith(expectedTemplate);
    expect(res.statusCode).to.equal(HTTP_STATUS_CODES.FORBIDDEN);
    expect(req.log.error).to.have.been.calledOnce;

    expect(next).not.to.have.been.called;
  });

  it("should render session-expired template if the error is a csrf missing error and the session is invalid", () => {
    delete req.session;

    const err = new Error("Invalid CSRF token") as any;
    err.code = CSRF_MISSING_CODE;

    const renderSpy = sinon.spy(res, "render");
    const expectedTemplate = "common/errors/session-expired.njk";

    csrfMissingHandler(err, req, res, next);

    expect(renderSpy).to.have.been.calledOnceWith(expectedTemplate);
    expect(res.statusCode).to.equal(HTTP_STATUS_CODES.FORBIDDEN);
    expect(req.log.warn).to.have.been.calledOnce;

    expect(next).not.to.have.been.called;
  });

  it("should call next for any other error", () => {
    const err = new Error("Some other error") as any;
    err.code = "ANOTHER_ERROR";

    csrfMissingHandler(err, req, res, next);

    expect(req.log.error).not.to.have.been.called;
    expect(req.log.warn).not.to.have.been.called;

    expect(next).to.have.been.called;
  });
});
