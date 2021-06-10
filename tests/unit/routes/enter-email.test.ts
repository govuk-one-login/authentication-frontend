import request from "supertest";
import { describe } from "mocha";
import { createApp } from "../../../src/app";

const { JSDOM } = require("jsdom");

describe("GET /enter-email", () => {
    let token: string;
    let cookies: string;

    beforeEach((done) => {
        request(createApp())
            .get("/enter-email")
            .end((er, resp) => {
                const dom = new JSDOM(resp.text);
                token = dom.window.document.getElementsByName("_csrf")[0].value;
                cookies = resp.headers["set-cookie"];
                done();
            });
    });

    it("should return OK status", (done) => {
        request(createApp()).get("/enter-email").expect(200, done);
    });

    it("should return bad request", (done) => {
        request(createApp())
            .post("/enter-email")
            .type("form")
            .set("Cookie", cookies)
            .send({
                _csrf: token,
                email: "",
            })
            .expect(400, done);
    });
});
