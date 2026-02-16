import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response, Application } from "express";
import nock from "nock";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import request from "supertest";

describe("Integration:: amc callback", () => {
  let app: Application;
  let baseApi: string;

  before(async () => {
    process.env.SUPPORT_SINGLE_FACTOR_ACCOUNT_DELETION = "1";
    baseApi = process.env.FRONTEND_API_BASE_URL;
    app = await stubMiddlewareAndCreateApp();
  });

  after(() => {
    app = undefined;
    nock.cleanAll();
    sinon.restore();
  });

  it("should return 200 with success message when AMC callback is successful", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.AMC_CALLBACK)
      .once()
      .reply(200, "Success message");

    const requestPath =
      PATH_NAMES.AMC_CALLBACK + "?code=test-code&state=test-state";

    await request(app)
      .get(requestPath)
      .expect(200)
      .expect(function (res) {
        expect(res.body.message).to.equal("Success message");
      });
  });

  it("should return 400 when AMC callback fails", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.AMC_CALLBACK)
      .once()
      .reply(400, "Error message");

    const requestPath =
      PATH_NAMES.AMC_CALLBACK + "?code=test-code&state=test-state";

    await request(app).get(requestPath).expect(400);
  });

  it("should return 400 when code parameter is missing", async () => {
    const requestPath = PATH_NAMES.AMC_CALLBACK + "?state=test-state";

    await request(app).get(requestPath).expect(400);
  });

  it("should return 400 when state parameter is missing", async () => {
    const requestPath = PATH_NAMES.AMC_CALLBACK + "?code=test-code";

    await request(app).get(requestPath).expect(400);
  });
});

const stubMiddlewareAndCreateApp = async (): Promise<Application> => {
  const { createApp } = await esmock(
    "../../../app.js",
    {},
    {
      "../../../middleware/session-middleware.js": {
        validateSessionMiddleware: sinon.fake(function (
          req: Request,
          res: Response,
          next: NextFunction
        ): void {
          res.locals.sessionId = "test-session-id";
          res.locals.clientSessionId = "test-client-session-id";
          res.locals.persistentSessionId = "test-persistent-session-id";

          req.session.user = {
            email: "test@test.com",
            journey: getPermittedJourneyForPath(PATH_NAMES.AMC_CALLBACK),
          };

          next();
        }),
      },
    }
  );

  return await createApp();
};
