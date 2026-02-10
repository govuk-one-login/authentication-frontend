import { describe } from "mocha";
import { expect } from "chai";
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
        expect(res.text).to.contain("GOV.UK");
      });
  });
});
