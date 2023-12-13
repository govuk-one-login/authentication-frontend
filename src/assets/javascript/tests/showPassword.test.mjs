import { assert } from "chai";
import { JSDOM } from "jsdom";
import showPasswordModule from "../showPassword.mjs";


describe("Show password functionality", () => {
    let component, inputElement, buttonElement, spanElement;

    beforeEach(() => {
        const dom = new JSDOM("<div class=\"govuk-show-password\" data-module=\"show-password\" data-disable-form-submit-check=\"false\" data-show-text=\"Show\" data-hide-text=\"Hide\" data-show-full-text=\"Show password\" data-hide-full-text=\"Hide password\" data-announce-show=\"Your password is shown\" data-announce-hide=\"Your password is hidden\"><div class=\"govuk-form-group\"><h1 class=\"govuk-label-wrapper\"><label class=\"govuk-label govuk-label--l\" for=\"password\">Enter your password</label></h1><input class=\"govuk-input govuk-!-width-two-thirds govuk-password-input\" id=\"password\" name=\"password\" type=\"password\" spellcheck=\"false\" autocomplete=\"off\"></div></input></div>");
        global.window = dom.window;
        global.document = dom.window.document;
        const pwElement = dom.window.document.querySelector("[data-module=\"show-password\"]");
        showPasswordModule.init(pwElement);
        inputElement = global.document.querySelector(".govuk-input--with-password");
        buttonElement = global.document.querySelector(".govuk-show-password__toggle");
        spanElement = global.document.querySelector(".govuk-visually-hidden");
    });

    it("Default Behaviour", () => {
        //check default behavior
        assert.equal(inputElement.getAttribute("type"), "password");
        assert.equal(buttonElement.getAttribute("aria-label"), "Show password");
        assert.equal(buttonElement.innerHTML, "Show");
        assert.equal(spanElement.innerHTML, "Your password is hidden");
    });

    it("Toggle Password", () => {
        showPasswordModule.togglePassword({preventDefault: () => {return ""}});

        //check behavior after an initial toggle
        assert.equal(inputElement.getAttribute("type"), "text");
        assert.equal(buttonElement.getAttribute("aria-label"), "Hide password");
        assert.equal(buttonElement.innerHTML, "Hide");
        assert.equal(spanElement.innerHTML, "Your password is shown");

        showPasswordModule.togglePassword({preventDefault: () => {return ""}});

        //check behaviour returns to default after second toggle
        assert.equal(inputElement.getAttribute("type"), "password");
        assert.equal(buttonElement.getAttribute("aria-label"), "Show password");
        assert.equal(buttonElement.innerHTML, "Show");
        assert.equal(spanElement.innerHTML, "Your password is hidden");
    });

    
    it(("Revert To Password On Form Submit"), () => {
        showPasswordModule.togglePassword({preventDefault: () => {return ""}});
        
        //check behavior after an initial toggle
        assert.equal(inputElement.getAttribute("type"), "text");
        assert.equal(buttonElement.getAttribute("aria-label"), "Hide password");
        assert.equal(buttonElement.innerHTML, "Hide");
        assert.equal(spanElement.innerHTML, "Your password is shown");

        showPasswordModule.revertToPasswordOnFormSubmit();

        //check behaviour returns to default after submit
        assert.equal(inputElement.getAttribute("type"), "password");
        assert.equal(buttonElement.getAttribute("aria-label"), "Show password");
        assert.equal(buttonElement.innerHTML, "Show");
        assert.equal(spanElement.innerHTML, "Your password is hidden");
    });
});