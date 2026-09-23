import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import request from "supertest";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import {
  noInterventions,
  setupAccountInterventionsResponse,
} from "../../../../test/helpers/account-interventions-helpers.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";

describe("Integration::reset-password step rejects an off-journey enter-email POST", () => {
  let app: any;
  let baseApi: string;
  let capturedUser: any;

  const SESSION_EMAIL = "user@example.com";
  const OTHER_EMAIL = "other@example.com";

  before(async () => {
    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "1";

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
            res.locals.sessionId = "session-id";
            res.locals.clientSessionId = "client-session-id";
            res.locals.persistentSessionId = "persistent-id";

            if (!req.session.user) {
              req.session.user = {
                email: SESSION_EMAIL,
                journey: getPermittedJourneyForPath(PATH_NAMES.RESET_PASSWORD),
              };
              req.session.client = { redirectUri: "https://rp.host/redirect" };
            }

            capturedUser = req.session.user;
            next();
          }),
        },
      }
    );

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
    delete process.env.SUPPORT_ACCOUNT_INTERVENTIONS;
  });

  it("redirects the POST back to /reset-password and does not reach the backend", async () => {
    const agent = request.agent(app);

    setupAccountInterventionsResponse(baseApi, noInterventions);
    const getRes = await agent.get(PATH_NAMES.RESET_PASSWORD).expect(200);
    const { token } = extractCsrfTokenAndCookies(getRes);
    expect(capturedUser.journey.nextPath).to.equal(PATH_NAMES.RESET_PASSWORD);

    const userExistsScope = nock(baseApi)
      .post(API_ENDPOINTS.USER_EXISTS, (body) => body.email === OTHER_EMAIL)
      .reply(400, { code: 1045, message: "locked" });

    await agent
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .send({
        _csrf: token,
        email: OTHER_EMAIL,
        browserSupportsWebAuthn: "false",
      })
      .expect(302)
      .expect("location", PATH_NAMES.RESET_PASSWORD);

    expect(
      userExistsScope.isDone(),
      "the guard rejected the off-journey POST before it reached the backend"
    ).to.equal(false);
    expect(
      capturedUser.journey.nextPath,
      "the journey stayed on /reset-password"
    ).to.equal(PATH_NAMES.RESET_PASSWORD);
  });
});
