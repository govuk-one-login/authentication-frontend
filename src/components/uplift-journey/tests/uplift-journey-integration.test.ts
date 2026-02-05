import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import request from "supertest";
import * as cheerio from "cheerio";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import esmock from "esmock";

const { testPhoneNumber, testRedactedPhoneNumber } = commonVariables;

describe("Integration::uplift journey", () => {
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

            req.session.user = {
              email: "test@test.com",
              mfaMethods: buildMfaMethods({
                phoneNumber: testPhoneNumber,
                redactedPhoneNumber: testRedactedPhoneNumber,
              }),
              journey: getPermittedJourneyForPath(PATH_NAMES.UPLIFT_JOURNEY),
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app)
      .get(PATH_NAMES.UPLIFT_JOURNEY)
      .then((res) => {
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

  it("should render lockout page when MFA returns indefinite international SMS block error", async () => {
    nock(baseApi).post(API_ENDPOINTS.MFA).once().reply(400, {
      code: 1092,
      message:
        "User is indefinitely blocked from sending SMS to international numbers",
    });

    const result = await request(app)
      .get(PATH_NAMES.UPLIFT_JOURNEY)
      .set("Cookie", cookies)
      .expect(200);

    const $ = cheerio.load(result.text);
    expect($("h1").text()).to.contains("Sorry, there is a problem");
    expect($("body").text()).to.contains("Try again later");
  });
});
