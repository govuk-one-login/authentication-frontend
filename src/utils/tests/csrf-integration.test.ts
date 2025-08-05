import { afterEach, describe } from "mocha";
import { expect, sinon } from "../../../test/utils/test-utils.js";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../app.constants.js";
import nock from "nock";
import request from "supertest";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../test/helpers/session-helper.js";
import esmock from "esmock";

const REDIRECT_URI = "https://rp.host/redirect";

describe("Integration::csrf checks", () => {
  let cookies: string;
  let app: any;

  before(async () => {
    const { createApp } = await esmock(
      "../../app.js",
      {},
      {
        "../../middleware/session-middleware.js": {
          validateSessionMiddleware: sinon.fake(function (
            req: Request,
            res: Response,
            next: NextFunction
          ): void {
            res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

            req.session.user = {
              journey: getPermittedJourneyForPath(
                PATH_NAMES.ENTER_EMAIL_SIGN_IN
              ),
            };

            req.session.client = {
              redirectUri: REDIRECT_URI,
            };

            next();
          }),
        },
      }
    );

    app = await createApp();

    await request(app)
      .get(PATH_NAMES.SIGN_IN_OR_CREATE)
      .then((res) => {
        cookies = res.headers["set-cookie"];
      });
  });

  beforeEach(() => {
    nock.cleanAll();
    sinon.restore(); // Restore all stubs before each test
    process.env.SUPPORT_REAUTHENTICATION = "0";
    process.env.TEST_SETUP_REAUTH_SESSION = "0";
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore(); // Restore all stubs after each test
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return error when csrf token does not match that in the session", async () => {
    await request(app)
      .post(PATH_NAMES.ENTER_EMAIL_SIGN_IN)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: "an-invalid-csrf-token",
        email: "test@test.com",
      })
      .expect(403);
  });

  it("should return the same csrf token on a subsequent request", async () => {
    // Make first request.
    let firstToken;

    await request(app)
      .get(PATH_NAMES.SIGN_IN_OR_CREATE)
      .set("Cookie", cookies)
      .then((res) => {
        const $ = cheerio.load(res.text);
        firstToken = $("[name=_csrf]").val();
      });

    // Make second request with the same session/cookies.
    let secondToken;

    await request(app)
      .get(PATH_NAMES.SIGN_IN_OR_CREATE)
      .set("Cookie", cookies)
      .then((res) => {
        const $ = cheerio.load(res.text);
        secondToken = $("[name=_csrf]").val();
      });

    expect(firstToken).to.exist;
    expect(secondToken).to.exist;
    expect(firstToken).to.equal(secondToken);
  });

  it("should return a new csrf token on a new session", async () => {
    // Make first request.
    let firstToken;

    await request(app)
      .get(PATH_NAMES.SIGN_IN_OR_CREATE)
      .set("Cookie", cookies)
      .then((res) => {
        const $ = cheerio.load(res.text);
        firstToken = $("[name=_csrf]").val();
        // Refresh cookies for the second request.
        cookies = res.headers["set-cookie"];
      });

    // Make second request.
    let secondToken;

    await request(app)
      .get(PATH_NAMES.SIGN_IN_OR_CREATE)
      .set("Cookie", cookies)
      .then((res) => {
        const $ = cheerio.load(res.text);
        secondToken = $("[name=_csrf]").val();
      });

    expect(firstToken).to.exist;
    expect(secondToken).to.exist;
    expect(firstToken).to.not.equal(secondToken);
  });
});
