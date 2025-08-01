import { describe } from "mocha";
import { createApp } from "../../src/app.js";
import request from "supertest";
import { expect } from "chai";

describe("static assets", () => {
  it("should be served with the correct cache control header", async () => {
    const app = await createApp();
    const response = await request(app).get("/assets/images/govuk-crest.svg");
    expect(response.header["cache-control"]).to.equal("public, max-age=60");
  });

  it("should be served without the x-powered-by header", async () => {
    const app = await createApp();
    const response = await request(app).get("/assets/images/govuk-crest.svg");
    expect(
      Object.keys(response.headers)
        .map((s) => s.toLowerCase())
        .includes("x-powered-by")
    ).to.be.false;
  });
});
