import request from "supertest";
import { describe } from "mocha";
import { AxiosResponse } from "axios";
import { sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { AuthCodeResponse, AuthCodeServiceInterface } from "../types";
import { AccountInterventionStatus, AccountInterventionsInterface } from "../../account-intervention/types"
import { createApiResponse } from "../../../utils/http";

describe("Integration:: get auth code", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../../app");
    decache("../../../middleware/session-middleware");
    decache("../../../common/send-notification/send-notification-service");
    decache("../../account-intervention/account-intervention-service");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    const authCodeService = require("../auth-code-service");
    // const accountInterventionService = require("../../account-intervention/account-intervention-service");
    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals = {
          ...res.locals,
          sessionId: "tDy103saszhcxbQq0-mjdzU854",
          clientSessionId: "test-client-session-id",
          persistentSessionId: "test-persistent-session-id",
        };

        req.session.user = {
          email: "test@test.com",
          isAccountRecoveryPermitted: true,
          journey: {
            nextPath: PATH_NAMES.AUTH_CODE,
          },
        };

        next();
      });

    sinon
      .stub(authCodeService, "authCodeService")
      .callsFake((): AuthCodeServiceInterface => {
        async function getAuthCode() {
          const fakeAxiosResponse: AxiosResponse = {
            data: "test",
            status: HTTP_STATUS_CODES.OK,
          } as AxiosResponse;

          return createApiResponse<AuthCodeResponse>(fakeAxiosResponse);
        }

        return { getAuthCode };
      });

      // sinon
      // .stub(accountInterventionService, "accountInterventionService")
      // .callsFake((): AccountInterventionsInterface => {
      //   async function accountInterventionStatus() {
      //     const fakeAxiosResponse: AxiosResponse = {
      //       data: {
      //         passwordResetRequired: false,
      //         blocked: false,
      //         temporarilySuspended: false,
      //       },
      //       status: HTTP_STATUS_CODES.OK,
      //     } as AxiosResponse;

      //     return createApiResponse<AccountInterventionStatus>(fakeAxiosResponse);
      //   }

      //   return { accountInterventionStatus };
      // });

    process.env.SUPPORT_ACCOUNT_INTERVENTIONS = "0";
    process.env.SUPPORT_ACCOUNT_RECOVERY = "1";

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL || "";

    request(app)
      .get(PATH_NAMES.AUTH_CODE)
      .end((err, res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it.only("should redirect to /auth-code when valid code entered", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.ACCOUNT_INTERVENTIONS)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        passwordResetRequired: false,
        blocked: false,
        temporarilySuspended: false,
      });

    request(app)
      .get(PATH_NAMES.AUTH_CODE)
      .expect(200, done);
  });

  it("should redirect to /password-reset-required when passwordResetRequired === true", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.ACCOUNT_INTERVENTIONS)
      .once()
      .reply(HTTP_STATUS_CODES.OK, {
        passwordResetRequired: true,
        blocked: false,
        temporarilySuspended: false,
      });

    request(app)
      .post(PATH_NAMES.PASSWORD_RESET_REQUIRED)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.GET_SECURITY_CODES)
      .expect(302, done);
  });
});
