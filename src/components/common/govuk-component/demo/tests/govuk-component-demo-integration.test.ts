import { describe } from "mocha";
import { createApp } from "../../../../../app.js";
import request from "supertest";

describe("Integration:: govuk component demo", () => {
  let app: any;

  before(async () => {
    app = await createApp();
  });

  it("should render demo page", async () => {
    await request(app).get("/govuk-component-demo").expect(200);
  });
});
