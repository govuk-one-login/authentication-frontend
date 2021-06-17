import { NextFunction, Request, Response } from "express";
import {expect, sinon} from "../../utils/testUtils";
import {describe} from 'mocha';
import {createSessionMiddleware, validateSessionMiddleware} from "../../../src/middleware/session-middleware";

describe("session-middleware", () => {
    let sandbox: sinon.SinonSandbox;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            session: {} as any,
        } as Partial<Request>;
        res = { status : sandbox.stub()} as Partial<Response>;
        next = sandbox.fake();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("createSessionMiddleware", () => {
        it("should create session when correct query params provided", () => {
            req.query = { "session-id":"de438203-98aa-46ee-883d-b42367ff4a2a", "scope": "openid email"};

            createSessionMiddleware(req as Request, res as Response, next);

            expect(req.session).to.have.property('user');
            expect(req.session.user).to.have.property('sessionId');
            expect(req.session.user).to.have.property('scope');
            expect(next).to.be.called;
        });

        it("should not create a session when session-id query param not provided", () => {
            req.query = { "test":"-b42367ff4a2a", "scope": "openid email"};

            createSessionMiddleware(req as Request, res as Response, next);

            expect(req.session).to.not.have.property('user');
            expect(next).to.be.called;
        });

        it("should not create a session when scope query param not provided", () => {
            req.query = { "session-id":"-b42367ff4a2a", "hope": "test"};

            createSessionMiddleware(req as Request, res as Response, next);

            expect(req.session).to.not.have.property('user');
            expect(next).to.be.called;
        });

        it("should not create a session when no query params present", () => {
            req.query = {};

            createSessionMiddleware(req as Request, res as Response, next);

            expect(req.session).to.not.have.property('user');
            expect(next).to.be.called;
        });
    });

    describe("validateSessionMiddleware", () => {
        it("should validate session and call next", () => {
            req.session = { isPopulated: true, user :{ sessionId:"test", scope:"openid"}}

            validateSessionMiddleware(req as Request, res as Response, next);

            expect(next).to.be.called;
        });
        it("should call next with error when invalid session", () => {
            validateSessionMiddleware(req as Request, res as Response, next);

            expect(res.status).to.be.called.calledWith(401);
            // expect(next).to.be.called.with(Error);
        });
    });
});
