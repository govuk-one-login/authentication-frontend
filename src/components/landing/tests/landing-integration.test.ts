import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils";
import nock from "nock";
import decache from "decache";
import { PATH_NAMES } from "../../../app.constants";
import { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper";

describe("Integration:: landing", () => {
  let app: any;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = await import(
      "../../../middleware/session-middleware"
    );
    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (
        req: Request,
        res: Response,
        next: NextFunction
      ): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user = {
          email: "test@test.com",
          journey: getPermittedJourneyForPath(PATH_NAMES.SIGN_IN_OR_CREATE),
        };
        next();
      });

    app = await (await import("../../../app")).createApp();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should redirect to /sign-in-or-create", async () => {
    await request(app, (test) => test.get(PATH_NAMES.ROOT).expect(403));
  });
});
