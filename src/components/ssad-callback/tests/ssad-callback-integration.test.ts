import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import {
  API_ENDPOINTS,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { NextFunction, Request, Response, Application } from "express";
import nock from "nock";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import request from "supertest";

const accountDeleteOutcome = (success: boolean, actions: unknown[] = []) => ({
  sub: "test-sub",
  outcome_id: "test-outcome-id",
  email: "test@test.com",
  scope: "account-delete",
  success,
  actions,
});

const accountDeleteFailure = (description: string) =>
  accountDeleteOutcome(false, [
    {
      action: "account-delete",
      startedAt: 1,
      completedAt: 1,
      success: false,
      details: { error: { code: 1001, description } },
    },
  ]);

const REQUEST_PATH =
  PATH_NAMES.SSAD_CALLBACK + "?code=test-code&state=test-state";

describe("Integration:: ssad callback", () => {
  let app: Application;
  let baseApi: string;

  before(async () => {
    process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION = "1";
    baseApi = process.env.FRONTEND_API_BASE_URL;
    app = await stubMiddlewareAndCreateApp(MFA_METHOD_TYPE.SMS);
  });

  after(() => {
    app = undefined;
    nock.cleanAll();
    sinon.restore();
  });

  it("should redirect to the account deleted page when AMC deleted the account", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.AMC_CALLBACK)
      .once()
      .reply(200, accountDeleteOutcome(true));

    const requestPath =
      PATH_NAMES.SSAD_CALLBACK + "?code=test-code&state=test-state";

    await request(app)
      .get(requestPath)
      .expect(302)
      .expect("Location", PATH_NAMES.ACCOUNT_DELETED);
  });

  [
    {
      mfaMethodType: MFA_METHOD_TYPE.SMS,
      expectedPath: PATH_NAMES.ENTER_MFA,
    },
    {
      mfaMethodType: MFA_METHOD_TYPE.AUTH_APP,
      expectedPath: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
    },
  ].forEach(({ mfaMethodType, expectedPath }) => {
    ["UserBackedOutOfJourney", "UserAbortedJourney"].forEach((description) => {
      it(`should redirect an ${mfaMethodType} user to ${expectedPath} when AMC returns ${description}`, async () => {
        const mfaApp = await stubMiddlewareAndCreateApp(mfaMethodType);
        nock(baseApi)
          .post(API_ENDPOINTS.AMC_CALLBACK)
          .once()
          .reply(200, accountDeleteFailure(description));

        await request(mfaApp)
          .get(REQUEST_PATH)
          .expect(302)
          .expect("Location", expectedPath);
      });
    });
  });

  it("should return 400 when AMC returns an unexpected error description", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.AMC_CALLBACK)
      .once()
      .reply(200, accountDeleteFailure("JourneyFailed"));

    await request(app).get(REQUEST_PATH).expect(400);
  });

  it("should return 400 when SSAD callback fails", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.AMC_CALLBACK)
      .once()
      .reply(400, "Error message");

    const requestPath =
      PATH_NAMES.SSAD_CALLBACK + "?code=test-code&state=test-state";

    await request(app).get(requestPath).expect(400);
  });

  it("should return 400 when code parameter is missing", async () => {
    const requestPath = PATH_NAMES.SSAD_CALLBACK + "?state=test-state";

    await request(app).get(requestPath).expect(400);
  });

  it("should return 400 when state parameter is missing", async () => {
    const requestPath = PATH_NAMES.SSAD_CALLBACK + "?code=test-code";

    await request(app).get(requestPath).expect(400);
  });
});

const stubMiddlewareAndCreateApp = async (
  mfaMethodType: MFA_METHOD_TYPE
): Promise<Application> => {
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
          res.locals.currentUrl = new URL("http://localhost" + req.originalUrl);

          req.session.user = {
            email: "test@test.com",
            journey: getPermittedJourneyForPath(PATH_NAMES.SSAD_AUTHORIZE),
            mfaMethodType,
          };

          next();
        }),
      },
    }
  );

  return await createApp();
};
