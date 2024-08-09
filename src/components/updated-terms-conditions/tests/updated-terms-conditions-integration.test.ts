import request from "supertest";
import { beforeEach, describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";

describe("Integration:: updated-terms-code", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        res.locals.clientSessionId = "tDy103saszhcxbQq0-mjdzU33d";
        res.locals.persistentSessionId = "dips-123456-abc";

        req.session.user = {
          email: "test@test.com",
          phoneNumber: "7867",
          journey: {
            nextPath: PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
          },
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app)
      .get(PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS)
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

  it("should return update terms and conditions page", async () => {
    await request(app)
      .get(PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS)
      .expect(HTTP_STATUS_CODES.OK);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS)
      .type("form")
      .send({
        termsAndConditionsResult: "reject",
      })
      .expect(500);
  });

  it("should redirect to /auth_code when terms accepted", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.UPDATE_PROFILE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app)
      .post(PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        termsAndConditionsResult: "accept",
      })
      .expect("Location", PATH_NAMES.AUTH_CODE)
      .expect(302);
  });
});
