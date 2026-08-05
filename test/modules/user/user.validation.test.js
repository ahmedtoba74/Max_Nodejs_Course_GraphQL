import { expect } from "chai";
import { Types } from "mongoose";

import {
    validateGetUser,
    validateUpdateUser,
} from "../../../src/modules/user/user.validation.js";
import AppError from "../../../src/utils/appError.js";

describe("User Validation", () => {
    it("Should throw 422 AppError with message Invalid user ID. for wrong userId", () => {
        try {
            validateGetUser(2);
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data[0].message).to.equal("Invalid user ID.");
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
        }
    });

    it("Should not throw an error for valid user id for get user", () => {
        expect(() =>
            validateGetUser("64f123456789012345678901"),
        ).to.not.throw();
    });

    it("Should throw 422 AppError with message Invalid email address. for invalid email", () => {
        try {
            validateUpdateUser({
                userId: "64f123456789012345678901",
                email: "invalid-email",
            });
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data[0].message).to.equal("Invalid email address.");
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
        }
    });

    it("Should throw 422 AppError with message Invalid user ID. for wrong userId", () => {
        try {
            validateUpdateUser({ userId: 2 });
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data[0].message).to.equal("Invalid user ID.");
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
        }
    });

    it("Should not throw an error for valid user update data", () => {
        expect(() =>
            validateUpdateUser({
                userId: "64f123456789012345678901",
                status: "Active",
                name: "John Doe",
                email: "test@test.com",
            }),
        ).to.not.throw();
    });

    it("Should throw 422 AppError with message Name must be at least 3 characters long. for short name", () => {
        try {
            validateUpdateUser({
                userId: "64f123456789012345678901",
                name: "Jo",
            });
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data[0].message).to.equal(
                "Name must be at least 3 characters long.",
            );
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
        }
    });

    it("Should throw 422 AppError with message Status must be between 1 and 280 characters. for long status", () => {
        try {
            validateUpdateUser({
                userId: "64f123456789012345678901",
                status: "a".repeat(281),
            });
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data[0].message).to.equal(
                "Status must be between 1 and 280 characters.",
            );
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
        }
    });
});
