import { assert } from "chai";
import { JSDOM } from "jsdom";
import Sinon from "sinon";
import phonenumberModule from "../phonenumber.mjs";


describe("Phone number initialisation", () => {

    it("Local number, no event listener", () => {
        const dom = new JSDOM("<input id=\"hasInternationalPhoneNumber\">");
        global.window = dom.window;
        global.document = dom.window.document;
        const checkbox = document.querySelector("#hasInternationalPhoneNumber");
        Sinon.spy(checkbox);

        phonenumberModule.init();

        assert(checkbox.addEventListener.notCalled);
    });

    it("International, input enabled", () => {
        const dom = new JSDOM("<div id=\"phoneNumber\" class=\"govuk-input--disabled\"><input id=\"hasInternationalPhoneNumber\"></input></div>");
        global.window = dom.window;
        global.document = dom.window.document;
        const checkbox = document.querySelector("#hasInternationalPhoneNumber");
        const input = document.querySelector("#phoneNumber");
        Sinon.spy(checkbox);

        phonenumberModule.init();

        assert(checkbox.addEventListener.calledOnce);
        assert.isFalse(input.disabled);
        assert.isFalse(input.classList.contains("govuk-input--disabled"));
    });

    it("International, input disabled", () => {
        const dom = new JSDOM("<div id=\"phoneNumber\"><input id=\"hasInternationalPhoneNumber\"></input></div>");
        global.window = dom.window;
        global.document = dom.window.document;
        const checkbox = document.querySelector("#hasInternationalPhoneNumber");
        checkbox.checked = true;
        const input = document.querySelector("#phoneNumber");
        Sinon.spy(checkbox);

        phonenumberModule.init();

        assert(checkbox.addEventListener.calledOnce);
        assert.isTrue(input.disabled);
        assert.isTrue(input.classList.contains("govuk-input--disabled"));
    });
});