import { expect } from "chai";
import { describe } from "mocha";
import type { NextFunction, Request, Response } from "express";
import { sinon } from "../../../test/utils/test-utils.js";
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from "../../app.constants.js";
import { serverErrorHandler } from "../internal-server-error-handler.js";
describe("serverErrorHandler", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    res = {
      headersSent: false,
      statusCode: 200,
      render: () => {},
      status: function (newStatus: number) {
        this.statusCode = newStatus;
      },
    } as unknown as Response;
    next = sinon.spy();
  });

  it("should call next if headers have already been sent", () => {
    res.headersSent = true;
    const err = new Error("Test error");

    serverErrorHandler(err, req, res, next);

    expect(next).to.have.been.calledOnceWith(err);
    expect(res.statusCode).to.equal(200);
  });

  it("should render mid-journey-direct-navigation template if session is invalid and not a GOV.UK request", () => {
    res.statusCode = HTTP_STATUS_CODES.UNAUTHORIZED;
    const err = new Error(
      ERROR_MESSAGES.INVALID_SESSION_NON_GOV_UK_EXTERNAL_REQUEST
    );
    const renderSpy = sinon.spy(res, "render");
    const expectedTemplate = "common/errors/mid-journey-direct-navigation.njk";
    const expectedData = {
      accountManagementUrl: "http://localhost:6001",
    };

    serverErrorHandler(err, req, res, next);

    expect(renderSpy).to.have.been.calledOnceWith(
      expectedTemplate,
      expectedData
    );
    expect(res.statusCode).to.equal(HTTP_STATUS_CODES.UNAUTHORIZED);
  });

  it("should render mid-journey-direct-navigation template if user navigates to root", () => {
    res.statusCode = HTTP_STATUS_CODES.FORBIDDEN;
    const err = new Error(ERROR_MESSAGES.FORBIDDEN);
    const renderSpy = sinon.spy(res, "render");
    const expectedTemplate = "common/errors/mid-journey-direct-navigation.njk";
    const expectedData = {
      accountManagementUrl: "http://localhost:6001",
    };

    serverErrorHandler(err, req, res, next);

    expect(renderSpy).to.have.been.calledOnceWith(
      expectedTemplate,
      expectedData
    );
    expect(res.statusCode).to.equal(HTTP_STATUS_CODES.FORBIDDEN);
  });

  it("should render session-expired template if session is invalid and it is a GOV.UK request", () => {
    res.statusCode = HTTP_STATUS_CODES.UNAUTHORIZED;
    const err = new Error(
      ERROR_MESSAGES.INVALID_SESSION_GOV_UK_INTERNAL_REQUEST
    );
    const renderSpy = sinon.spy(res, "render");
    const expectedTemplate = "common/errors/session-expired.njk";

    serverErrorHandler(err, req, res, next);

    expect(renderSpy).to.have.been.calledOnceWith(expectedTemplate);
    expect(res.statusCode).to.equal(HTTP_STATUS_CODES.UNAUTHORIZED);
  });

  it("should render 500 template if error is not unauthorized and headers have not been sent", () => {
    const err = new Error("Test error");
    const renderSpy = sinon.spy(res, "render");
    const expectedTemplate = "common/errors/500.njk";

    serverErrorHandler(err, req, res, next);

    expect(renderSpy).to.have.been.calledOnceWith(expectedTemplate);
    expect(res.statusCode).to.equal(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  });
});
