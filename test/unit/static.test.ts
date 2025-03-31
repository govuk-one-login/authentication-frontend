import { describe } from "mocha";
import { createApp } from "../../src/app";
import request from "supertest";
import { expect } from "chai";

describe("static assets", () => {
  it("should be served with the correct cache control header", async () => {
    const app = await createApp();
    const response = await request(app).get(
      "/assets/images/govuk-crest-2x.png"
    );
    expect(response.header["cache-control"]).to.equal("public, max-age=60");
  });
});
