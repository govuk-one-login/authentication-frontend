import { describe, it } from "mocha";
import { expect } from "chai";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

const scriptContent = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/assets/javascript/prevent-double-form-submit.js"
  ),
  "utf-8"
);

describe("prevent-double-form-submit", () => {
  function setup(html: string) {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body>${html}<script>${scriptContent}</script></body></html>`,
      { runScripts: "dangerously" }
    );
    return {
      document: dom.window.document,
      window: dom.window as unknown as Window,
    };
  }

  function submitForm(form: HTMLFormElement, window: Window) {
    form.dispatchEvent(new window.Event("submit", { cancelable: true }));
  }

  function createSubmitCounter(form: HTMLFormElement): () => number {
    let count = 0;
    form.addEventListener("submit", (e) => {
      if (!e.defaultPrevented) count++;
    });
    return () => count;
  }

  it("should prevent second submission when button has data-prevent-double-click", () => {
    const { document, window } = setup(`
      <form>
        <button type="submit" data-prevent-double-click="true">Submit</button>
      </form>
    `);

    const form = document.querySelector("form") as HTMLFormElement;
    const button = document.querySelector("button") as HTMLButtonElement;
    const getSubmitCount = createSubmitCounter(form);

    submitForm(form, window);
    expect(getSubmitCount()).to.equal(1);
    expect(button.dataset.submitting).to.equal("true");

    submitForm(form, window);
    expect(getSubmitCount()).to.equal(1);
  });

  it("should allow multiple submissions when button lacks data-prevent-double-click", () => {
    const { document, window } = setup(`
      <form>
        <button type="submit">Submit</button>
      </form>
    `);

    const form = document.querySelector("form") as HTMLFormElement;
    const getSubmitCount = createSubmitCounter(form);

    submitForm(form, window);
    submitForm(form, window);

    expect(getSubmitCount()).to.equal(2);
  });

  it("should handle multiple forms independently", () => {
    const { document, window } = setup(`
      <form id="form1">
        <button type="submit" data-prevent-double-click="true">Submit 1</button>
      </form>
      <form id="form2">
        <button type="submit">Submit 2</button>
      </form>
    `);

    const form1 = document.querySelector("#form1") as HTMLFormElement;
    const form2 = document.querySelector("#form2") as HTMLFormElement;
    const button1 = form1.querySelector("button") as HTMLButtonElement;
    const button2 = form2.querySelector("button") as HTMLButtonElement;
    const getSubmit1Count = createSubmitCounter(form1);
    const getSubmit2Count = createSubmitCounter(form2);

    submitForm(form1, window);
    expect(getSubmit1Count()).to.equal(1);
    expect(button1.dataset.submitting).to.equal("true");

    submitForm(form2, window);
    expect(getSubmit2Count()).to.equal(1);
    expect(button2.dataset.submitting).to.be.undefined;

    submitForm(form1, window);
    submitForm(form2, window);
    expect(getSubmit1Count()).to.equal(1);
    expect(getSubmit2Count()).to.equal(2);
  });

  it("should do nothing when form has no submit button", () => {
    const { document, window } = setup(`
      <form>
        <input type="text" name="field" />
      </form>
    `);

    const form = document.querySelector("form") as HTMLFormElement;
    const getSubmitCount = createSubmitCounter(form);

    submitForm(form, window);
    submitForm(form, window);

    expect(getSubmitCount()).to.equal(2);
  });

  it("should only affect buttons with data-prevent-double-click=true", () => {
    const { document, window } = setup(`
      <form>
        <button type="submit" data-prevent-double-click="false">Submit</button>
      </form>
    `);

    const form = document.querySelector("form") as HTMLFormElement;
    const getSubmitCount = createSubmitCounter(form);

    submitForm(form, window);
    submitForm(form, window);

    expect(getSubmitCount()).to.equal(2);
  });
});
