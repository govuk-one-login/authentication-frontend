import request from "supertest";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import decache from "decache";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants";
import { LandingServiceInterface, StartAuthResponse } from "../types";
import { createApiResponse } from "../../../utils/http";
import { AxiosResponse } from "axios";

describe("Integration:: landing", () => {
  let app: any;

  before(async () => {
    process.env.SUPPORT_AUTH_ORCH_SPLIT = "0";
    decache("../../../app");
    decache("../landing-service");
    decache("../../../middleware/session-middleware");
    const landingService = require("../landing-service");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user = {
          email: "test@test.com",
          journey: {
            nextPath: PATH_NAMES.SIGN_IN_OR_CREATE,
          },
        };
        next();
      });

    sinon
      .stub(landingService, "landingService")
      .callsFake((): LandingServiceInterface => {
        async function start() {
          const fakeAxiosResponse: AxiosResponse = {
            data: {
              client: {
                serviceType: "MANDATORY",
                clientName: "test-client",
                scopes: ["openid"],
                cookieConsentEnabled: true,
                consentEnabled: true,
                redirectUri: "http://test-redirect.gov.uk/callback",
                state: "jasldasl12312",
                isOneLoginService: false,
              },
              user: {
                consentRequired: true,
                upliftRequired: false,
                identityRequired: false,
                authenticated: false,
              },
            },
            status: HTTP_STATUS_CODES.OK,
          } as AxiosResponse;

          return createApiResponse<StartAuthResponse>(fakeAxiosResponse);
        }

        return { start };
      });
    app = await require("../../../app").createApp();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should redirect to /sign-in-or-create", (done) => {
    request(app)
      .get(PATH_NAMES.ROOT)
      .expect("Location", PATH_NAMES.SIGN_IN_OR_CREATE)
      .expect(302, done);
  });
});
