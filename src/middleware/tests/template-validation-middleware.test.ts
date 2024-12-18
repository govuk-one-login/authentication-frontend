import chai, { expect } from "chai";
import { Request, Response } from "express";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";
import { templateValidationMiddleware } from "../template-validation-middleware";

chai.use(sinonChai);

describe("templateValidationMiddleware", () => {
  const BASIC_TEMPLATE_PATH =
    "../middleware/tests/template-validation-basic-test.njk";
  const debugLog = sinon.spy();
  const next = sinon.spy();
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest({
      session: { client: {}, user: {} },
      log: {
        debug: debugLog,
      },
    });
    res = mockResponse();
    templateValidationMiddleware(req as Request, res as Response, next);
  });

  it("logs looked up properties in a template", () => {
    res.render(BASIC_TEMPLATE_PATH);

    expect(debugLog).to.have.been.calledWithExactly(
      `template "${BASIC_TEMPLATE_PATH}" looks up these properties ${JSON.stringify(
        {
          variableNames: [
            "scriptNonce",
            "taxonomyLevel1",
            "taxonomyLevel2",
            "contentId",
          ],
          translationKeys: [
            "pages.mandatory.title",
            "pages.someExampleTextToTranslate",
          ],
        }
      )}`
    );
  });
});
