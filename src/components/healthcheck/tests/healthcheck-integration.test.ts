import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils.js";
import { PATH_NAMES } from "../../../app.constants.js";
import decache from "decache";

describe("Integration::healthcheck", () => {
  let sandbox: sinon.SinonSandbox;
  let app: any;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/requires-auth-middleware");
    sandbox = sinon.createSandbox();
    app = await (await import("../../../app.js")).createApp();
  });

  after(() => {
    sandbox.restore();
    sinon.restore();
    app = undefined;
  });

  it("healthcheck should return 200 OK", async () => {
    await request(app, (test) => test.get(PATH_NAMES.HEALTHCHECK).expect(200));
  });
});
