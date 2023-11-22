import { assert } from "chai";
import { JSDOM } from "jsdom";
import Sinon from "sinon";
import radiobuttonModule from "../radiobutton.mjs";


describe("Radio button init", () => {

    it("Event listener added to button, button selected", () => {
        const dom = new JSDOM("<div id=\"contact-details-container\"><input name=\"feedbackContact\">click me</input><input id=\"email\" type=\"text\" value = \"test\">test</input></div>");
        global.window = dom.window;
        global.document = dom.window.document;
        const radioButton = document.querySelector('input[name="feedbackContact"]');
        Sinon.spy(radioButton);

        radiobuttonModule.init();

        assert(radioButton.addEventListener.calledOnce);
        const container = document.querySelector("#contact-details-container");
        radioButton.value = true;
        radioButton.click();
        assert.isFalse(container.classList.contains("govuk-!-display-none"));
        const textInput = document.querySelector("#email");
        assert.equal(textInput.value, "test");
    });

    it("Event listener added to button, button deselected", () => {
        const dom = new JSDOM("<div id=\"contact-details-container\" class=\"govuk-!-display-none\"><input name=\"feedbackContact\">click me</input><input id=\"email\" type=\"text\" value = \"test\">test</input></div>");
        global.window = dom.window;
        global.document = dom.window.document;
        const radioButton = document.querySelector('input[name="feedbackContact"]');
        Sinon.spy(radioButton);

        radiobuttonModule.init();

        assert(radioButton.addEventListener.calledOnce);
        const container = document.querySelector("#contact-details-container");
        radioButton.value = false;
        radioButton.click();
        assert.isTrue(container.classList.contains("govuk-!-display-none"));
        const textInput = document.querySelector("#email");
        assert.isEmpty(textInput.value);
    });
});