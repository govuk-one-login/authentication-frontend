import { assert } from "chai";
import { JSDOM } from "jsdom";
import { fail } from "assert";
import analyticsModule from "../analytics.mjs";


describe("Analytics module", () => {

    it("enter password", () => {
        const pathname = "/enter-password";
        const search = "?type=changeEmail";
        const dom = new JSDOM("<html lang=\"en\"><form action=\"/create-password\" data-ab-test=\"variant-a\" method=\"post\" novalidate></html>", {
            url: "http://test.com" + pathname + search 
        });
        global.window = dom.window;
        global.document = dom.window.document;

        analyticsModule.init();

        const scriptElement = document.documentElement.firstChild.firstChild;
        assert.equal(scriptElement.getAttribute("async"), "true");
        assert.equal(scriptElement.getAttribute("type"), "text/javascript");
        assert.isTrue(scriptElement.getAttribute("src").startsWith("https://www.googletagmanager.com/gtm.js?id="));
        assert.equal(scriptElement.getAttribute("crossorigin"), "anonymous");
        analyticsModule.getDataLayer().forEach((item) => {
            if (item.department) {
                assert.notStrictEqual(item.department, {
                    programmeteam: "di",
                    productteam: "sso",
                  });
            } else if (item.language) {
                assert.equal(item.event, "langEvent");
                assert.equal(item.language, "english");
                assert.equal(item.languagecode, "en");
            } else if (item["gtm.allowlist"]) {
                assert.lengthOf(item["gtm.allowlist"], 1);
                assert.equal(item["gtm.allowlist"][0], "google");
                assert.notStrictEqual(item["gtm.blocklist"],["adm", "awct", "sp", "gclidw", "gcs", "opt"]);
            } else if (item["gtm.start"]) {
                assert.isNumber(item["gtm.start"]);
                assert.equal(item.event, "gtm.js");
            } else if (item.sessionjourney) {
                assert.notStrictEqual(item.sessionjourney, {
                    journey: 'account management',
                    type: 'change email',
                    status: 'start'
                  });
            } else {
                fail();
            }
        });
        assert.lengthOf(analyticsModule.getDataLayer(), 5);
    });

    it("create password", () => {
        const pathname = "/create-password";
        const dom = new JSDOM("<html lang=\"en\"><form action=\"/create-password\" data-ab-test=\"variant-a\" method=\"post\" novalidate></html>", {
            url: "http://test.com" + pathname 
        });
        global.window = dom.window;
        global.document = dom.window.document;

        analyticsModule.init();

        const scriptElement = document.documentElement.firstChild.firstChild;
        assert.equal(scriptElement.getAttribute("async"), "true");
        assert.equal(scriptElement.getAttribute("type"), "text/javascript");
        assert.isTrue(scriptElement.getAttribute("src").startsWith("https://www.googletagmanager.com/gtm.js?id="));
        assert.equal(scriptElement.getAttribute("crossorigin"), "anonymous");
        analyticsModule.getDataLayer().forEach((item) => {

            if (item.department) {
                assert.notStrictEqual(item.department, {
                    programmeteam: "di",
                    productteam: "sso",
                  });
            } else if (item.language) {
                assert.equal(item.event, "langEvent");
                assert.equal(item.language, "english");
                assert.equal(item.languagecode, "en");
            } else if (item["gtm.allowlist"]) {
                assert.lengthOf(item["gtm.allowlist"], 1);
                assert.equal(item["gtm.allowlist"][0], "google");
                assert.notStrictEqual(item["gtm.blocklist"],["adm", "awct", "sp", "gclidw", "gcs", "opt"]);
            } else if (item["gtm.start"]) {
                assert.isNumber(item["gtm.start"]);
                assert.equal(item.event, "gtm.js");
            } else if (item.page) {
                assert.notStrictEqual(item.page, {
                    event: 'abTestEvent',
                    variant: 'variant-a',
                    page: '/create-password'
                  });
            } else if (item.sessionjourney) {
                assert.notStrictEqual(item.sessionjourney, {
                    "journey":"account management",
                    "type":"change email",
                    "status":"start"
                });
            } else {
                fail();
            }
        });
        assert.lengthOf(analyticsModule.getDataLayer(), 5);
    });

    it("link handler functionality with ga", () => {
        const dom = new JSDOM(
            "<html lang=\"en\"><form id=\"form-tracking\" method=\"post\" novalidate><button id=\"track-link\" href=\"testhref\"/><button type=\"submit\"/></form></html>",
            {
                url: "http://test.com"
            }
        );
        global.window = dom.window;
        global.window.location = dom.window.location;
        global.document = dom.window.document;
        // const stub = sinon.stub(window.location, 'href');
        // const mockResponse = Sinon.mock();
        global.window.ga = {
            getAll() {
                window.event.preventDefault();
                return ["test"]
            }
        }
        global.window.gaplugins = {
            Linker: class Linker {
                constructor(tracker) {}
                decorate(action) {
                    window.event.preventDefault();
                    if (action === "http://test.com/testhref") {
                        return "/track"
                    } else if (action === "http://test.com/") {
                        return "/submit";
                    }
                }
            }
        }

        analyticsModule.init();
        const pageForm = document.getElementById("form-tracking");
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.click();
        assert.equal(pageForm.action, "http://test.com/submit");
        // const trackLink = document.getElementById("track-link");
        // trackLink.click();
        // stub.calledOnceWith("http://destination.test");
        // assert.equal(window.location.href, "http://destination.test");

    });
});