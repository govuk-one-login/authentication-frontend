import { assert } from "chai";
import { JSDOM } from "jsdom";
import Sinon from "sinon";
import cookiesModule from "../cookies.mjs";
import applicationModule from "../application.mjs";
import phonenumberModule from "../phonenumber.mjs";
import radiobuttonModule from "../radiobutton.mjs";
import showPasswordModule from "../showPassword.mjs";
import analyticsModule from "../analytics.mjs";


describe("Application module with consent", () => {
    let phoneNumberMock, radioButtonMock, showPasswordMock, cookiesInitMock, cookiesConstentMock, analyticsMock;

    beforeEach(() => {
        const dom = new JSDOM("<div class=\"govuk-show-password\" data-module=\"show-password\" data-disable-form-submit-check=\"false\" data-show-text=\"Show\" data-hide-text=\"Hide\" data-show-full-text=\"Show password\" data-hide-full-text=\"Hide password\" data-announce-show=\"Your password is shown\" data-announce-hide=\"Your password is hidden\"><div class=\"govuk-form-group\"><h1 class=\"govuk-label-wrapper\"><label class=\"govuk-label govuk-label--l\" for=\"password\">Enter your password</label></h1><input class=\"govuk-input govuk-!-width-two-thirds govuk-password-input\" id=\"password\" name=\"password\" type=\"password\" spellcheck=\"false\" autocomplete=\"off\"></div></input></div><div></div>");
        global.window = dom.window;
        global.window.GOVUKFrontend = {initAll(){}}
        global.document = dom.window.document;
        phoneNumberMock = Sinon.mock(phonenumberModule);
        radioButtonMock = Sinon.mock(radiobuttonModule);
        showPasswordMock = Sinon.mock(showPasswordModule);
        cookiesInitMock = Sinon.mock(cookiesModule);
        cookiesConstentMock = Sinon.mock(cookiesModule);
        analyticsMock = Sinon.mock(analyticsModule);
    });

    afterEach(() => {
        phoneNumberMock.restore();
        radioButtonMock.restore();
        showPasswordMock.restore();
        cookiesInitMock.restore();
        cookiesConstentMock.restore();
        analyticsMock.restore();
    });

    it("Loads modules with consent", async () => {
        phoneNumberMock.expects("init").once();
        radioButtonMock.expects("init").once();
        showPasswordMock.expects("init").once();
        cookiesInitMock.expects("init").once();
        cookiesConstentMock.expects("hasConsentForAnalytics").once().returns(true);
        analyticsMock.expects("init").once();
        
        applicationModule.init({
            uaTrackingId: 123456,
            analyticsCookieDomain: "myDomain"
        });


        phoneNumberMock.verify();
        radioButtonMock.verify();
        showPasswordMock.verify();
        cookiesInitMock.verify();
        cookiesConstentMock.verify();
        analyticsMock.verify();
    });

    it("Loads modules without consent then change in consent with custom event", async () => {
        phoneNumberMock.expects("init").once();
        radioButtonMock.expects("init").once();
        showPasswordMock.expects("init").once();
        cookiesInitMock.expects("init").once();
        cookiesConstentMock.expects("hasConsentForAnalytics").returns(false);
        analyticsMock.expects("init").never();
        
        applicationModule.init({
            uaTrackingId: 123456,
            analyticsCookieDomain: "myDomain"
        });


        phoneNumberMock.verify();
        radioButtonMock.verify();
        showPasswordMock.verify();
        cookiesInitMock.verify();
        cookiesConstentMock.verify();
        analyticsMock.verify();

        analyticsMock = Sinon.mock(analyticsModule);
        analyticsMock.expects("init").once();

        const event = document.createEvent('CustomEvent');
        event.initCustomEvent("cookie-consent");
        window.dispatchEvent(event);

        analyticsMock.verify();
    });
});