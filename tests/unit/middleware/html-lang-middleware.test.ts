import {expect} from 'chai';
import {describe} from 'mocha';
import {NextFunction} from "express";
import {sinon} from "../../utils/testUtils";
import {setHtmlLangMiddleware} from "../../../src/middleware/html-lang-middleware";

describe("HTML Lang middleware", () => {
    it("should add language to request locals", () => {
        const i18nMock = {language: "en"};
        const req: any = {i18n: i18nMock};
        const res: any = {locals: {}};
        const nextFunction: NextFunction = sinon.fake();

        setHtmlLangMiddleware(req, res, nextFunction);

        expect(res.locals).to.have.property('htmlLang')
        expect(nextFunction).to.have.been.called;
    });

    it("should call next function", () => {
        const req: any = {};
        const res: any = {locals: {}};
        const nextFunction: NextFunction = sinon.fake();

        setHtmlLangMiddleware(req, res, nextFunction);

        expect(res.locals).to.not.have.property('htmlLang')
        expect(nextFunction).to.have.been.called;
    });
});
