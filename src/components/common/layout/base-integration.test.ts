import request from "supertest";
import { describe } from "mocha";
import { expect } from "chai";
import * as cheerio from "cheerio";
import { sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import decache from "decache";
import { PATH_NAMES, CHANNEL } from "../../../app.constants";

describe("Integration:: base page ", () => {
  let app: any;

  const setupApp = async (channel: string) => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        if (channel === CHANNEL.WEB) {
          res.locals.webChannel = true;
        } else if (channel === CHANNEL.STRATEGIC_APP) {
          res.locals.strategicAppChannel = true;
        }

        req.session.client = {
          serviceType: "MANDATORY",
        };
        req.session.user = {
          email: "test@test.com",

          phoneNumber: "7867",
          journey: {
            nextPath: PATH_NAMES.SIGN_IN_OR_CREATE,
            optionalPaths: [PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION],
          },
        };

        next();
      });

    app = await require("../../../app").createApp();
  };

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return the sign in or create page", async () => {
    await setupApp(CHANNEL.WEB);
    await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE).expect(200);
  });
  it("footer should be on page", async () => {
    await setupApp(CHANNEL.WEB);
    const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
    expect(response.status).to.equal(200);
    const $ = cheerio.load(response.text);
    expect($(".govuk-footer").length).to.equal(1);
  });
  it("footer should not be on page", async () => {
    await setupApp(CHANNEL.STRATEGIC_APP);
    const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
    expect(response.status).to.equal(200);
    const $ = cheerio.load(response.text);
    expect($(".govuk-footer").length).to.equal(0);
  });
});
