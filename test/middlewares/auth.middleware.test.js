import { expect } from "chai";
import sinon from "sinon";
import authGuard from "../../src/middlewares/auth.middleware.js";
import { generateToken } from "../../src/utils/jwtHelper.js";
import jwt from "jsonwebtoken";

describe("Auth Middleware", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("should set isAuth to false if no Authorization header is present", () => {
        const req = {
            get: () => null,
        };
        const res = {};
        const next = sinon.spy();

        authGuard(req, res, next);

        expect(req.isAuth).to.be.false;
        expect(next.calledOnce).to.be.true;
    });

    it("should set isAuth to false if Authorization header token is empty", () => {
        const req = {
            get: () => "Bearer ",
        };
        const res = {};
        const next = sinon.spy();

        authGuard(req, res, next);

        expect(req.isAuth).to.be.false;
        expect(next.calledOnce).to.be.true;
    });

    it("should set isAuth to false if token is invalid", () => {
        const req = {
            get: () => "Bearer invalid.token.here",
        };
        const res = {};
        const next = sinon.spy();

        authGuard(req, res, next);

        expect(req.isAuth).to.be.false;
        expect(next.calledOnce).to.be.true;
    });

    it("should set isAuth to true and attach userId if Authorization header token is valid", () => {
        const userId = "64f123456789012345678901";

        sinon.stub(jwt, "verify").returns({ id: userId });

        // const validToken = generateToken({ id: userId });

        const req = {
            get: () => "Bearer dummy_string_token",
        };
        const res = {};
        const next = sinon.spy();

        authGuard(req, res, next);

        expect(req.isAuth).to.be.true;
        expect(req.userId).to.equal(userId);
        expect(next.calledOnce).to.be.true;
    });
});
