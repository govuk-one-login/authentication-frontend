import { assert } from "chai";
import { JSDOM } from "jsdom";
import cookiesModule from "../cookies.mjs";

describe("Cookie module functionality", () => {
    let component, domain, cookiesAccepted, cookiesRejected, hideCookieBanner, cookieBannerContainer, cookieBanner, acceptCookies, rejectCookies, cookieString;

    beforeEach(() => { 
        cookieString = "_octo=GH1.1.1861779767.1699874914; preferred_color_mode=light; tz=Europe%2FLondon";

        const dom = new JSDOM(
            "<div class=\"govuk-cookie-banner \" data-nosnippet=\"\" role=\"region\" aria-label=\"Cookies on GOV.UK One Login\" hidden=\"\"><div class=\"govuk-cookie-banner__message govuk-width-container\" id=\"cookies-banner-main\"><div class=\"govuk-grid-row\"><div class=\"govuk-grid-column-two-thirds\"><h2 class=\"govuk-cookie-banner__heading govuk-heading-m\">Cookies on GOV.UK One Login</h2><div class=\"govuk-cookie-banner__content\"><p class=\"govuk-body\">We use some essential cookies to make this service work.</p><p class=\"govuk-body\">We’d also like to use analytics cookies so we can understand how you use the service and make improvements.</p></div></div></div><div class=\"govuk-button-group\"><button value=\"accept\" type=\"button\" name=\"cookiesAccept\" class=\"govuk-button\" data-module=\"govuk-button\">Accept analytics cookies</button><button value=\"reject\" type=\"button\" name=\"cookiesReject\" class=\"govuk-button\" data-module=\"govuk-button\">Reject analytics cookies</button><a class=\"govuk-link\" href=\"/cookies\">View cookies</a></div></div><div class=\"govuk-cookie-banner__message govuk-width-container\" id=\"cookies-accepted\" hidden=\"\"><div class=\"govuk-grid-row\"><div class=\"govuk-grid-column-two-thirds\"><div class=\"govuk-cookie-banner__content\"><p class=\"govuk-body\">You’ve accepted additional cookies. You can <a class=\"govuk-link\" href=\"/cookies\">change your cookie settings</a>  at any time.</p></div></div></div><div class=\"govuk-button-group\"><a href=\"#\" role=\"button\" draggable=\"false\" class=\"govuk-button cookie-hide-button\" data-module=\"govuk-button\" aria-label=\"Hide this message\">Hide this message</a></div></div><div class=\"govuk-cookie-banner__message govuk-width-container\" id=\"cookies-rejected\" hidden=\"\"><div class=\"govuk-grid-row\"><div class=\"govuk-grid-column-two-thirds\"><div class=\"govuk-cookie-banner__content\"><p class=\"govuk-body\">You’ve rejected additional cookies. You can <a class=\"govuk-link\" href=\"/cookies\">change your cookie settings</a>  at any time.</p></div></div></div><div class=\"govuk-button-group\"><a href=\"#\" role=\"button\" draggable=\"false\" class=\"govuk-button cookie-hide-button\" data-module=\"govuk-button\" aria-label=\"Hide this message\">Hide this message</a></div></div></div>");
        global.window = dom.window;
        global.document = dom.window.document;
        global.document.__defineGetter__("cookie", () => {
            return cookieString;
        });
        global.document.__defineSetter__("cookie", (value) => {
            cookieString += cookieString + ";" + value;
        });
        cookiesAccepted = document.querySelector("#cookies-accepted");
        cookiesRejected = document.querySelector("#cookies-rejected");
        hideCookieBanner = document.querySelectorAll(".cookie-hide-button");
        cookieBannerContainer = document.querySelector(".govuk-cookie-banner");
        cookieBanner = document.querySelector("#cookies-banner-main");
        acceptCookies = document.querySelector('button[name="cookiesAccept"]');
        rejectCookies = document.querySelector('button[name="cookiesReject"]');
        domain = "www.gov.uk";
        global.document.domain = domain;

        cookiesModule.init();
    });

    it("Banner loads with no cookie", () => {
        assert.equal(cookieBannerContainer.getAttribute("style"), "display: block;");
    });

    it("Banner doesn't load with a cookie", () => {
        const dom = new JSDOM(
            "<div class=\"govuk-cookie-banner \" data-nosnippet=\"\" role=\"region\" aria-label=\"Cookies on GOV.UK One Login\" hidden=\"\"><div class=\"govuk-cookie-banner__message govuk-width-container\" id=\"cookies-banner-main\"><div class=\"govuk-grid-row\"><div class=\"govuk-grid-column-two-thirds\"><h2 class=\"govuk-cookie-banner__heading govuk-heading-m\">Cookies on GOV.UK One Login</h2><div class=\"govuk-cookie-banner__content\"><p class=\"govuk-body\">We use some essential cookies to make this service work.</p><p class=\"govuk-body\">We’d also like to use analytics cookies so we can understand how you use the service and make improvements.</p></div></div></div><div class=\"govuk-button-group\"><button value=\"accept\" type=\"button\" name=\"cookiesAccept\" class=\"govuk-button\" data-module=\"govuk-button\">Accept analytics cookies</button><button value=\"reject\" type=\"button\" name=\"cookiesReject\" class=\"govuk-button\" data-module=\"govuk-button\">Reject analytics cookies</button><a class=\"govuk-link\" href=\"/cookies\">View cookies</a></div></div><div class=\"govuk-cookie-banner__message govuk-width-container\" id=\"cookies-accepted\" hidden=\"\"><div class=\"govuk-grid-row\"><div class=\"govuk-grid-column-two-thirds\"><div class=\"govuk-cookie-banner__content\"><p class=\"govuk-body\">You’ve accepted additional cookies. You can <a class=\"govuk-link\" href=\"/cookies\">change your cookie settings</a>  at any time.</p></div></div></div><div class=\"govuk-button-group\"><a href=\"#\" role=\"button\" draggable=\"false\" class=\"govuk-button cookie-hide-button\" data-module=\"govuk-button\" aria-label=\"Hide this message\">Hide this message</a></div></div><div class=\"govuk-cookie-banner__message govuk-width-container\" id=\"cookies-rejected\" hidden=\"\"><div class=\"govuk-grid-row\"><div class=\"govuk-grid-column-two-thirds\"><div class=\"govuk-cookie-banner__content\"><p class=\"govuk-body\">You’ve rejected additional cookies. You can <a class=\"govuk-link\" href=\"/cookies\">change your cookie settings</a>  at any time.</p></div></div></div><div class=\"govuk-button-group\"><a href=\"#\" role=\"button\" draggable=\"false\" class=\"govuk-button cookie-hide-button\" data-module=\"govuk-button\" aria-label=\"Hide this message\">Hide this message</a></div></div></div>");
        global.window = dom.window;
        global.document = dom.window.document;
        global.document.__defineGetter__("cookie", () => {
            return cookieString;
        });
        global.document.__defineSetter__("cookie", (value) => {
            cookieString += cookieString + "; " + value;
        });
        acceptCookies.click();
        cookiesModule.init();
        cookieBannerContainer = document.querySelector("#cookies-banner-main");
        assert.isNull(cookieBannerContainer.getAttribute("style"));
    });

    it("Constructor behaviour", () => {
        const values = ["test1", "test2"];
        cookiesModule.setCookie("test", values, { days: 1 });
        const cookie = cookiesModule.getCookie("test");
        assert.notStrictEqual(cookie, values);
    });

    it("Set/get cookie", () => {
        const values = ["test1", "test2"];
        cookiesModule.setCookie("test", values, { days: 1 });
        const cookie = cookiesModule.getCookie("test");
        assert.notStrictEqual(cookie, values);
    });

    it("has analytics consent", () => {
        assert.isFalse(cookieBanner.classList.contains("hide"));
        acceptCookies.click();
        assert.isTrue(cookiesModule.hasConsentForAnalytics());
        assert.equal(cookieBanner.getAttribute("style"), "display: none;");
        assert.equal(cookiesAccepted.getAttribute("style"), "display: block;");
    });

    it("does not have analytics consent", () => {
        rejectCookies.click();
        assert.isFalse(cookiesModule.hasConsentForAnalytics());
        assert.equal(cookieBanner.getAttribute("style"), "display: none;");
        assert.equal(cookiesRejected.getAttribute("style"), "display: block;");
    });

    it("hide buttons functionality", () => {
        const hideButtons = Array.prototype.slice.call(hideCookieBanner);
        hideButtons.forEach((button) => {
            cookieBannerContainer.setAttribute("style", "display: block;");
            button.click();
            assert.equal(cookieBannerContainer.getAttribute("style"), "display: none;");
        });
    });
});