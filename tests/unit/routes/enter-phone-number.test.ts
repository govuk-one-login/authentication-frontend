import request from "supertest";
import { describe } from "mocha";

import { createApp } from "../../../src/app";

describe("Unit testing the /enter-phone-number GET route", () => {
  it("should return OK status", (done) => {
    request(createApp())
      .get("/enter-phone-number")
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        return done();
      });
  });
});
