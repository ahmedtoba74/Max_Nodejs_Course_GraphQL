import { expect } from "chai";
import {
    validateSignup,
    validateLogin,
} from "../../../src/modules/auth/auth.validation.js";
import AppError from "../../../src/utils/appError.js";

describe("Auth Validation", () => {
    it("should throw a 422 AppError if password shorter than 6 characters", () => {
        const invalidInput = {
            email: "test@test.com",
            name: "Ahmed",
            password: "123",
        };
        try {
            validateSignup(invalidInput);
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
            expect(error.data[0].message).to.equal(
                "Password must be at least 6 characters long.",
            );
        }
    });

    it("should throw a 422 AppError if email is invalid", () => {
        const invalidInput = {
            email: "invalid-email",
            name: "Ahmed",
            password: "password123",
        };
        try {
            validateSignup(invalidInput);
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
            expect(error.data[0].message).to.equal("Invalid email address.");
        }
    });

    it("should throw a 422 AppError if name is empty or shorter than 3 characters", () => {
        const invalidInput = {
            email: "test@test.com",
            name: "A",
            password: "password123",
        };
        try {
            validateSignup(invalidInput);
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
            expect(error.data[0].message).to.equal(
                "Name is required and must be at least 3 characters long.",
            );
        }
    });

    it("should not throw an error if input is valid", () => {
        const validInput = {
            email: "test@test.com",
            name: "Ahmed Toba",
            password: "123456",
        };
        expect(() => validateSignup(validInput)).to.not.throw();
    });

    it("should throw a 422 AppError if email is invalid", () => {
        const invalidInput = {
            email: "invalid-email",
            password: "password123",
        };
        try {
            validateLogin(invalidInput);
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
            expect(error.data[0].message).to.equal("Invalid email address.");
        }
    });

    it("should throw a 422 App Error if password is empty", () => {
        const invalidInput = {
            email: "test@test.com",
            password: "",
        };
        try {
            validateLogin(invalidInput);
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.data).to.be.an("array").that.has.lengthOf(1);
            expect(error.data[0].message).to.equal("Password is required.");
        }
    });

    it("should not throw an error if input is valid", () => {
        const validInput = {
            email: "test@test.com",
            password: "password123",
        };
        expect(() => validateLogin(validInput)).to.not.throw();
    });
});
