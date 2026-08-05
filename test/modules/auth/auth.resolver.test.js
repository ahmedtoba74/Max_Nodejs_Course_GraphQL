import { expect } from "chai";
import Sinon from "sinon";

import { authService } from "../../../src/modules/auth/auth.service.js";
import { authResolvers } from "../../../src/modules/auth/auth.resolver.js";
import AppError from "../../../src/utils/appError.js";

describe("Auth Resolver", () => {
    afterEach(() => {
        Sinon.restore();
    });

    it("it should Create new user successfully", async () => {
        const dummyUserId = "64f123456789012345678901";

        Sinon.stub(authService, "signup").resolves({
            user: {
                _doc: { name: "test", email: "test@test.com" },
                _id: dummyUserId,
            },
        });

        const context = {
            res: {
                cookie: Sinon.spy(),
            },
        };

        const result = await authResolvers.createUser(
            {
                userInput: {
                    email: "test@test.com",
                    password: "[PASSWORD]",
                    name: "test",
                },
            },
            context,
        );

        expect(result).to.deep.equal({
            name: "test",
            email: "test@test.com",
            _id: dummyUserId,
        });
    });

    it("Should throw 400 AppError if user already exists", async () => {
        Sinon.stub(authService, "signup").rejects(
            new AppError("User already exists", 400),
        );
        const context = {
            res: {
                cookie: Sinon.spy(),
            },
        };
        try {
            await authResolvers.createUser(
                {
                    userInput: {
                        email: "test@test.com",
                        password: "[PASSWORD]",
                        name: "test",
                    },
                },
                context,
            );
            expect.fail("Should have thrown 400 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(400);
            expect(error.message).to.equal("User already exists");
            expect(context.res.cookie.called).to.be.false;
        }
    });

    it("Should throw 422 AppError if user validation failed and not to call authServices", async () => {
        Sinon.stub(authService, "signup").rejects(
            new AppError("User validation failed", 422),
        );
        const context = {
            res: {
                cookie: Sinon.spy(),
            },
        };
        try {
            await authResolvers.createUser(
                {
                    userInput: {
                        email: "test@test.com",
                        password: "wrongPassword",
                        name: "test",
                    },
                },
                context,
            );
            expect.fail("Should have thrown 422 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.message).to.equal("User validation failed");
            expect(context.res.cookie.called).to.be.false;
        }
    });

    it("Login should set cookie and return token and userId when sevice success", async () => {
        const dummyUserId = "64f123456789012345678901";
        const dummyToken = "mocked_jwt_token";

        Sinon.stub(authService, "login").resolves({
            user: { _id: dummyUserId, email: "test@test.com" },
            token: dummyToken,
        });

        const context = {
            res: {
                cookie: Sinon.spy(),
            },
        };

        const result = await authResolvers.login(
            {
                email: "test@test.com",
                password: "[PASSWORD]",
            },
            context,
        );

        expect(result).to.deep.equal({
            token: dummyToken,
            userId: dummyUserId,
        });
        expect(context.res.cookie.calledOnce).to.be.true;
        expect(context.res.cookie.calledWith("token", dummyToken)).to.be.true;
    });

    it("Should throw 422 AppError if validation fails and not call authService", async () => {
        const loginStub = Sinon.stub(authService, "login");

        try {
            await authResolvers.login(
                {
                    email: "invalid-email",
                    password: "",
                },
                {},
            );
            expect.fail("Should have thrown a validation error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(loginStub.called).to.be.false;
        }
    });

    it("Should propagate 401 error from authService and not set cookie", async () => {
        Sinon.stub(authService, "login").rejects(
            new AppError("Invalid email or password", 401),
        );
        const context = {
            res: {
                cookie: Sinon.spy(),
            },
        };
        try {
            await authResolvers.login(
                {
                    email: "test@test.com",
                    password: "WrongPassword",
                },
                context,
            );
            expect.fail("Should have thrown 401 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(401);
            expect(context.res.cookie.called).to.be.false;
        }
    });
});
