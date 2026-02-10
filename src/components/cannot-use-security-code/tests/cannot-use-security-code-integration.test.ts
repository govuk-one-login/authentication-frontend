import { describe } from "mocha";
import { expect } from "chai";
import * as cheerio from "cheerio";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import { createApp } from "../../../app.js";

describe("Integration:: cannot-use-security-code", () => {
  let app: any;

  before(async () => {
    app = await createApp();
  });

  after(() => {
    app = undefined;
  });

  it("should return cannot use security code page", async () => {
    await request(app)
      .get(PATH_NAMES.CANNOT_USE_SECURITY_CODE)
      .expect(200)
      .then((res) => {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contain(
          "Sorry, there's a problem"
        );
        expect(
          $("a")
            .toArray()
            .some((link) => $(link).attr("href") === "")
        ).to.be.true;
      });
  });
});
