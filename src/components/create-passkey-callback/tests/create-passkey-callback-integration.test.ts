import { afterEach, describe } from "mocha";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import type { Application, NextFunction, Request, Response } from "express";
import esmock from "esmock";
import { sinon } from "../../../../test/utils/test-utils.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import nock from "nock";
import request from "supertest";
import { AMC_SCOPE } from "../types.js";
import type { UserSession } from "../../../types.js";

describe("Integration:: create passkey callback", () => {
  let app: Application;
  let baseApi: string;
  let sessionUserOverrides: Partial<UserSession> = {};

  before(async () => {
    process.env.SUPPORT_PASSKEY_REGISTRATION = "1";
    baseApi = process.env.FRONTEND_API_BASE_URL;
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
            res.locals.currentUrl = new URL(
              "http://localhost" + req.originalUrl
            );

            req.session.user = {
              email: "test@test.com",
              journey: getPermittedJourneyForPath(
                PATH_NAMES.CREATE_PASSKEY_CALLBACK
              ),
              ...sessionUserOverrides,
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
  });

  after(() => {
    app = undefined;
    nock.cleanAll();
    sinon.restore();
  });

  afterEach(() => {
    sessionUserOverrides = {};
  });

  it("should redirect to passkey-created when create passkey was successful in amc", async () => {
    nock(baseApi).post(API_ENDPOINTS.AMC_CALLBACK).once().reply(200, {
      success: true,
      scope: AMC_SCOPE.PASSKEY_CREATE,
    });

    const requestPath =
      PATH_NAMES.CREATE_PASSKEY_CALLBACK + "?code=test-code&state=test-state";

    await request(app)
      .get(requestPath)
      .expect(302)
      .expect("Location", PATH_NAMES.PASSKEY_CREATED);
  });

  it("should redirect to passkey-created when create passkey was successful in amc and terms not accepted", async () => {
    sessionUserOverrides = { isLatestTermsAndConditionsAccepted: false };

    nock(baseApi).post(API_ENDPOINTS.AMC_CALLBACK).once().reply(200, {
      success: true,
      scope: AMC_SCOPE.PASSKEY_CREATE,
    });

    const requestPath =
      PATH_NAMES.CREATE_PASSKEY_CALLBACK + "?code=test-code&state=test-state";

    await request(app)
      .get(requestPath)
      .expect(302)
      .expect("Location", PATH_NAMES.PASSKEY_CREATED);
  });

  it("should redirect to auth-code when create passkey was skipped in amc", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.AMC_CALLBACK)
      .once()
      .reply(200, {
        success: false,
        scope: AMC_SCOPE.PASSKEY_CREATE,
        journeys: [
          {
            journey: "passkey-create",
            details: {
              error: {
                code: 1,
                description: "UserAbortedJourney",
              },
            },
          },
        ],
      });

    const requestPath =
      PATH_NAMES.CREATE_PASSKEY_CALLBACK + "?code=test-code&state=test-state";

    await request(app)
      .get(requestPath)
      .expect(302)
      .expect("Location", PATH_NAMES.AUTH_CODE);
  });

  it("should redirect to create-passkey when user clicked back in amc", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.AMC_CALLBACK)
      .once()
      .reply(200, {
        success: false,
        scope: AMC_SCOPE.PASSKEY_CREATE,
        journeys: [
          {
            journey: "passkey-create",
            details: {
              error: {
                code: 1,
                description: "UserBackedOutOfJourney",
              },
            },
          },
        ],
      });

    const requestPath =
      PATH_NAMES.CREATE_PASSKEY_CALLBACK + "?code=test-code&state=test-state";

    await request(app)
      .get(requestPath)
      .expect(302)
      .expect("Location", PATH_NAMES.CREATE_PASSKEY);
  });
});
