import request from "supertest";
import { describe } from "mocha";
import { expect } from "chai";
import * as cheerio from "cheerio";
import { sinon } from "../../../../../test/utils/test-utils";
import nock from "nock";
import decache from "decache";
import { PATH_NAMES, CHANNEL } from "../../../../app.constants";

describe("Integration:: base page ", () => {
  let app: any;

  const setupApp = async (channel: string) => {
    decache("../../../../app");
    decache("../../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../../middleware/session-middleware");
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
          },
        };

        next();
      });

    app = await require("../../../../app").createApp();
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

  describe("Web channel", () => {
    it("should render the default govukHeader", async () => {
      await setupApp(CHANNEL.WEB);
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      const $ = cheerio.load(response.text);
      expect($("a.govuk-header__link").length).to.equal(1);
      expect($(".strategic-app-header").length).to.equal(0);
    });

    it("should render the beta banner", async () => {
      await setupApp(CHANNEL.WEB);
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      const $ = cheerio.load(response.text);
      expect($(".govuk-phase-banner").length).to.equal(1);
    });

    it("should render the footer", async () => {
      await setupApp(CHANNEL.WEB);
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      const $ = cheerio.load(response.text);
      expect($(".govuk-footer").length).to.equal(1);
    });
  });

  describe("Strategic App channel", () => {
    it("should render the custom header with no links", async () => {
      await setupApp(CHANNEL.STRATEGIC_APP);
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      const $ = cheerio.load(response.text);
      expect($("a.govuk-header__link").length).to.equal(0);
      expect($(".strategic-app-header").length).to.equal(1);
    });

    it("should not render the beta banner", async () => {
      await setupApp(CHANNEL.STRATEGIC_APP);
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      const $ = cheerio.load(response.text);
      expect($(".govuk-phase-banner").length).to.equal(0);
    });

    it("should not render the footer", async () => {
      await setupApp(CHANNEL.STRATEGIC_APP);
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      const $ = cheerio.load(response.text);
      expect($(".govuk-footer").length).to.equal(0);
    });
  });

  describe("Undefined channel", () => {
    it("should render the default header if no value is provided for channel", async () => {
      await setupApp("");
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      const $ = cheerio.load(response.text);
      expect($("a.govuk-header__link").length).to.equal(1);
    });
  });
});
