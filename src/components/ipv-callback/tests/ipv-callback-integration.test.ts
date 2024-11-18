import { describe } from "mocha";
import decache from "decache";
import { request, sinon } from "../../../../test/utils/test-utils";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";
import express from "express";
import nock from "nock";

describe("Integration:: ipv callback", () => {
  let app: express.Application;
  let baseApi: string;

  before(async () => {
    process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          email: "test@test.com",
          phoneNumber: "7867",
          journey: {
            nextPath: PATH_NAMES.IPV_CALLBACK,
          },
        };

        next();
      });
    baseApi = process.env.FRONTEND_API_BASE_URL;

    app = await require("../../../app").createApp();
  });

  after(() => {
    app = undefined;
    delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
    nock.cleanAll();
    sinon.restore();
  });

  it("should return basic response when ipv callback requested", async () => {
    nock(baseApi).post(API_ENDPOINTS.REVERIFICATION_RESULT).once().reply(200);

    await request(
      app,
      (test) => test.get(PATH_NAMES.IPV_CALLBACK).expect(200),
      { expectAnalyticsPropertiesMatchSnapshot: false }
    );
  });
});
