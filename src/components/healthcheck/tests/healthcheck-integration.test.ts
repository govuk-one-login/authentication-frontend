import request from "supertest";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import { PATH_NAMES } from "../../../app.constants";
import decache from "decache";

describe("Integration::healthcheck", () => {
  let sandbox: sinon.SinonSandbox;
  let app: any;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/requires-auth-middleware");
    sandbox = sinon.createSandbox();
    app = await require("../../../app").createApp();
  });

  after(() => {
    sandbox.restore();
    sinon.restore();
    app = undefined;
  });

  it("healthcheck should return 200 OK", async () => {
    await request(app).get(PATH_NAMES.HEALTHCHECK).expect(200);
  });
});
