import { beforeEach, describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import request from "supertest";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import esmock from "esmock";

describe("Integration:: updated-terms-code", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
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
            res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
            res.locals.clientSessionId = "tDy103saszhcxbQq0-mjdzU33d";
            res.locals.persistentSessionId = "dips-123456-abc";

            req.session.user = {
              email: "test@test.com",
              mfaMethods: buildMfaMethods({ phoneNumber: "7867" }),
              journey: getPermittedJourneyForPath(
                PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS
              ),
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
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
      .expect(403);
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
