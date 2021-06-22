import request from "supertest";
import { describe } from "mocha";
import { sinon } from "../../../../tests/utils/test-utils";
import * as sessionMiddleware from "../../../middleware/session-middleware";

const { JSDOM } = require("jsdom");

describe("Integration:: GET /enter-email", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string;
  let cookies: string;
  let mockValidationSession: any;
  let app: any;

  beforeEach((done) => {
    sandbox = sinon.createSandbox();

    mockValidationSession = sandbox
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req, res, next): void {
        req.session.user = {
          id: "12sadjk",
          email: "test@test.com",
          scope: "openid",
        };
        next();
      });

    app = require("../../../app").createApp();

    request(app)
      .get("/enter-email")
      .end((er, resp) => {
        const dom = new JSDOM(resp.text);
        token = dom.window.document.getElementsByName("_csrf")[0].value;
        cookies = resp.headers["set-cookie"];
        done();
      });
  });

  afterEach(() => {
    sinon.assert.called(mockValidationSession);
    sandbox.restore();
  });

  it("should return OK status", (done) => {
    request(app).get("/enter-email").expect(200, done);
  });

  it("should return bad request", (done) => {
    request(app)
      .post("/enter-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "",
      })
      .expect(400, done);
  });

  it("should return bad request2", (done) => {
    request(app)
      .post("/enter-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        email: "sa@kd.com",
      })
      .expect(400, done);
  });
});
