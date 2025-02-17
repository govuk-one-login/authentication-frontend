import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { expect } from "chai";
import { Application, NextFunction, Request, Response } from "express";
import { setupAccountInterventionsResponse } from "../../../../test/helpers/account-interventions-helpers";
import { getPermittedJourneyForPath } from "../../../utils/session";

describe("Integration::prove identity", () => {
  let cookies: string;
  let app: Application;
  let baseApi: string;

  before(async () => {
    decache("../../../middleware/session-middleware");
    decache("../../../app");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    baseApi = process.env.FRONTEND_API_BASE_URL;
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (
        req: Request,
        res: Response,
        next: NextFunction
      ): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          email: "joe.bloggs@test.com",
          journey: getPermittedJourneyForPath(PATH_NAMES.PROVE_IDENTITY),
        };

        req.session.client = {
          redirectUri: "https://example.com/unknown-page",
        };

        next();
      });

    app = await require("../../../app").createApp();

    await request(app, (test) => test.get(PATH_NAMES.ENTER_EMAIL_SIGN_IN)).then(
      (res) => {
        cookies = res.headers["set-cookie"];
      }
    );
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
    delete process.env.SUPPORT_ACCOUNT_INTERVENTIONS;
  });

  it("should redirect to orchestration when the account interventions response shows no issues", async () => {
    setupAccountInterventionsResponse(baseApi, {
      blocked: false,
      passwordResetRequired: false,
      temporarilySuspended: false,
      reproveIdentity: false,
    });

    const redirectUri = "https://some-redirect.com";

    nock(baseApi)
      .post(API_ENDPOINTS.ORCH_AUTH_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        location: redirectUri,
      });

    const response = await makeRequestToProveIdentityEndpoint();

    expect(response.status).to.eq(302);
    expect(response.headers.location).to.eq(redirectUri);
  });

  it("should redirect when account interventions flags user needs to reset password", async () => {
    setupAccountInterventionsResponse(baseApi, {
      blocked: false,
      passwordResetRequired: true,
      temporarilySuspended: false,
      reproveIdentity: false,
    });

    const response = await makeRequestToProveIdentityEndpoint();

    expect(response.status).to.eq(302);
    expect(response.headers.location).to.eq(PATH_NAMES.PASSWORD_RESET_REQUIRED);
  });

  it("should redirect when account interventions flags user is blocked", async () => {
    setupAccountInterventionsResponse(baseApi, {
      blocked: true,
      passwordResetRequired: false,
      temporarilySuspended: false,
      reproveIdentity: false,
    });

    const response = await makeRequestToProveIdentityEndpoint();

    expect(response.status).to.eq(302);
    expect(response.headers.location).to.eq(PATH_NAMES.UNAVAILABLE_PERMANENT);
  });

  const makeRequestToProveIdentityEndpoint = async () => {
    return request(app, (test) =>
      test.get(PATH_NAMES.PROVE_IDENTITY).set("Cookie", cookies)
    );
  };
});
