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
  let debugLog: sinon.SinonSpy;
  let warnLog: sinon.SinonSpy;
  let next: sinon.SinonSpy;
  let req: Request;
  let res: Response;
  let translations: { [key: string]: string };
  let options: { [key: string]: string };

  beforeEach(() => {
    translations = {
      "pages.mandatory.title": "A title",
      "pages.someExampleTextToTranslate": "Something to translate",
    };
    options = {
      scriptNonce: "123456",
      taxonomyLevel1: "template",
      taxonomyLevel2: "validation",
      contentId: "fake-content",
    };
    debugLog = sinon.spy();
    warnLog = sinon.spy();
    next = sinon.spy();
    req = mockRequest({
      session: { client: {}, user: {} },
      log: {
        debug: debugLog,
        warn: warnLog,
      },
    });
    res = mockResponse({
      locals: {
        t: (key: string) => translations[key] || key,
      },
    });
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

  it("does not log if all properties access have a value", () => {
    res.render(BASIC_TEMPLATE_PATH, options);

    expect(warnLog).to.have.been.callCount(0);
  });

  it("warns if template accesses properties that do not exist", () => {
    delete translations["pages.someExampleTextToTranslate"];
    delete options.taxonomyLevel2;

    res.render(BASIC_TEMPLATE_PATH, options);

    expect(warnLog).to.have.been.calledWithExactly(
      `template "${BASIC_TEMPLATE_PATH}" uses translation key "pages.someExampleTextToTranslate" that has no value`
    );
    expect(warnLog).to.have.been.calledWithExactly(
      `template "${BASIC_TEMPLATE_PATH}" uses variable name "taxonomyLevel2" that has no value`
    );
  });
});
