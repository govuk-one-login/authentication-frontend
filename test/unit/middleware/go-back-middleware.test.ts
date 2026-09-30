import { expect } from "chai";
import { describe } from "mocha";
import type { NextFunction } from "express";
import { sinon } from "../../utils/test-utils.js";
import { goBackMiddleware } from "../../../src/middleware/go-back-middleware.js";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { createMockRequest } from "../../helpers/mock-request-helper.js";
import { mockResponse } from "mock-req-res";

describe("Go back middleware", () => {
  [PATH_NAMES.ENTER_PASSWORD, PATH_NAMES.SIGN_IN_WITH_PASSKEY].forEach(
    (allowedPath) => {
      it(`should pop history, update nextPath and optionalPaths, save session and call next when valid back transition from ${allowedPath}`, async () => {
        const req = createMockRequest(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
        req.session.user.journey = {
          nextPath: allowedPath,
          goBackHistory: [PATH_NAMES.ENTER_EMAIL_SIGN_IN],
          optionalPaths: [],
        };
        const res = mockResponse();
        const nextFunction: NextFunction =
          sinon.fake() as unknown as NextFunction;
        req.session.save = sinon.spy((callback) => callback(null));

        await goBackMiddleware(req, res, nextFunction);

        expect(req.session.user.journey.goBackHistory).to.deep.eq([]);
        expect(req.session.user.journey.nextPath).to.eq(
          PATH_NAMES.ENTER_EMAIL_SIGN_IN
        );
        expect(req.session.user.journey.optionalPaths).to.deep.eq([
          PATH_NAMES.SIGN_IN_OR_CREATE,
          PATH_NAMES.ACCOUNT_LOCKED,
        ]);
        expect(nextFunction).to.be.called;
        expect(req.session.save).to.be.called;
      });
    }
  );

  it("should only pop the last entry when goBackHistory has multiple entries", async () => {
    const req = createMockRequest(PATH_NAMES.ENTER_EMAIL_SIGN_IN);
    req.session.user.journey = {
      nextPath: PATH_NAMES.ENTER_PASSWORD,
      goBackHistory: [
        PATH_NAMES.SIGN_IN_OR_CREATE,
        PATH_NAMES.ENTER_EMAIL_SIGN_IN,
      ],
      optionalPaths: [],
    };
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;
    req.session.save = sinon.spy((callback) => callback(null));

    await goBackMiddleware(req, res, nextFunction);

    expect(req.session.user.journey.goBackHistory).to.deep.eq([
      PATH_NAMES.SIGN_IN_OR_CREATE,
    ]);
    expect(req.session.user.journey.nextPath).to.eq(
      PATH_NAMES.ENTER_EMAIL_SIGN_IN
    );
    expect(nextFunction).to.be.called;
    expect(req.session.save).to.be.called;
  });

  it("should call next without modifying session when not a back transition", async () => {
    const req = createMockRequest(PATH_NAMES.ENTER_PASSWORD);
    req.session.user.journey = {
      nextPath: PATH_NAMES.ENTER_PASSWORD,
      goBackHistory: [PATH_NAMES.ENTER_EMAIL_SIGN_IN],
      optionalPaths: [],
    };
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;
    req.session.save = sinon.spy((callback) => callback(null));

    await goBackMiddleware(req, res, nextFunction);

    expect(req.session.user.journey.goBackHistory).to.deep.eq([
      PATH_NAMES.ENTER_EMAIL_SIGN_IN,
    ]);
    expect(req.session.user.journey.nextPath).to.eq(PATH_NAMES.ENTER_PASSWORD);
    expect(req.session.user.journey.optionalPaths).to.deep.eq([]);
    expect(req.session.save).to.not.be.called;
    expect(nextFunction).to.be.called;
  });

  it("should call next without modifying session when goBackHistory is empty", async () => {
    const req = createMockRequest(PATH_NAMES.ENTER_PASSWORD);
    req.session.user.journey = {
      nextPath: PATH_NAMES.ENTER_PASSWORD,
      goBackHistory: [],
      optionalPaths: [],
    };
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;
    req.session.save = sinon.spy((callback) => callback(null));

    await goBackMiddleware(req, res, nextFunction);

    expect(req.session.user.journey.goBackHistory).to.deep.eq([]);
    expect(req.session.user.journey.nextPath).to.eq(PATH_NAMES.ENTER_PASSWORD);
    expect(req.session.user.journey.optionalPaths).to.deep.eq([]);
    expect(req.session.save).to.not.be.called;
    expect(nextFunction).to.be.called;
  });

  it("should redirect and warn when back transition from a path not in goBackHistoryAllowList", async () => {
    const req = createMockRequest("/first-path");
    req.session.user.journey = {
      nextPath: "/second-path",
      goBackHistory: ["/first-path"],
      optionalPaths: [],
    };
    const res = mockResponse();
    const nextFunction: NextFunction = sinon.fake() as unknown as NextFunction;
    req.session.save = sinon.spy((callback) => callback(null));

    await goBackMiddleware(req, res, nextFunction);

    expect(res.redirect).to.be.calledWith("/second-path");
    expect(req.log.warn).to.have.been.calledWith(
      "User tried to use goBackHistory from invalid path /second-path in session and goBackHistory /first-path"
    );
    expect(req.session.save).to.not.be.called;
    expect(nextFunction).to.not.be.called;
  });
});
