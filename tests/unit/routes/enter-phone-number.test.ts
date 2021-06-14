const assert = require("assert");

import request from "supertest";
import { createApp } from "../../../src/app";

describe("Unit testing the /enter-phone-number GET route", () => {
  it("should return OK status", () => {
    const app = createApp();
    return request(app)
      .get("/enter-phone-number")
      .then(function (response) {
        assert.equal(response.status, 200);
      });
  });
});
