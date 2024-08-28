import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { AxiosResponse } from "axios";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants";
import {
  AccountRecoveryInterface,
  AccountRecoveryResponse,
} from "../../common/account-recovery/types";
import { createApiResponse } from "../../../utils/http";

describe("Integration:: enter authenticator app code", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    decache("../../common/account-recovery/account-recovery-service");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    const accountRecoveryService = require("../../common/account-recovery/account-recovery-service");

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
            nextPath: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
          },
        };
        next();
      });

    sinon
      .stub(accountRecoveryService, "accountRecoveryService")
      .callsFake((): AccountRecoveryInterface => {
        async function accountRecovery() {
          const fakeAxiosResponse: AxiosResponse = {
            data: {
              accountRecoveryPermitted: true,
            },
            status: HTTP_STATUS_CODES.OK,
          } as AxiosResponse;

          return createApiResponse<AccountRecoveryResponse>(fakeAxiosResponse);
        }

        return { accountRecovery };
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL || "";

    await request(app)
      .get(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .then((res) => {
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

  it("should return enter authenticator app security code", async () => {
    await request(app).get(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE).expect(200);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .send({
        code: "123456",
      })
      .expect(403);
  });

  it("should return validation error when code not entered", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains("Enter the code");
      })
      .expect(400);
  });

  it("should return validation error when code is less than 6 characters", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "2",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the code using only 6 digits"
        );
      })
      .expect(400);
  });

  it("should return validation error when code is greater than 6 characters", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "1234567",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the code using only 6 digits"
        );
      })
      .expect(400);
  });

  it("should return validation error when code entered contains letters", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "12ert-",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the code using only 6 digits"
        );
      })
      .expect(400);
  });

  it("following a validation error it should not include link to change security codes where account recovery is not permitted", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "12ert-",
        isAccountRecoveryPermitted: false,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("body").text()).to.not.contains(
          "You can securely change how you get security codes"
        );
      })
      .expect(400);
  });

  it("should redirect to /auth-code when valid code entered", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_MFA_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.AUTH_CODE)
      .expect(302);
  });

  it("should return validation error when incorrect code entered", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_MFA_CODE).once().reply(400, {
      code: ERROR_CODES.AUTH_APP_INVALID_CODE,
      success: false,
    });

    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123455",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "The code you entered is not correct, check your authenticator app and try again"
        );
      })
      .expect(400);
  });

  it("should redirect to security code expired when incorrect code has been entered 5 times", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_MFA_CODE).times(6).reply(400, {
      code: ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED,
      success: false,
    });

    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123455",
      })
      .expect(
        "Location",
        `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.AuthAppMfaMaxRetries}`
      )
      .expect(302);
  });
});
