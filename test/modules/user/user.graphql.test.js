import { expect } from "chai";
import request from "supertest";
import app from "../../../app.js";
import User from "../../../src/modules/user/user.model.js";

describe("User GraphQL E2E Suite", () => {
    it("Should get user successfully", async () => {
        await User.create({
            name: "Ahmed Toba",
            email: "test@test.com",
            password: "password123",
        });

        const loginRes = await request(app)
            .post("/graphql")
            .send({
                query: `
                    query Login($email: String!, $password: String!) {
                        login(email: $email, password: $password) {
                            token
                            userId
                        }
                    }
                `,
                variables: {
                    email: "test@test.com",
                    password: "password123",
                },
            });

        const token = loginRes.body.data.login.token;

        const res = await request(app)
            .post("/graphql")
            .set("Authorization", `Bearer ${token}`)
            .send({
                query: `
                    query {
                        getUser {
                            _id
                            name
                            email
                        }
                    }
                `,
            });
        expect(res.status).to.equal(200);
        expect(res.body.data.getUser).to.have.property("name", "Ahmed Toba");
        expect(res.body.data.getUser).to.have.property(
            "email",
            "test@test.com",
        );
        expect(res.body.data.getUser).to.have.property("_id");
    });
    it("Should update user successfully", async () => {
        await User.create({
            name: "Ahmed Toba",
            email: "test@test.com",
            password: "password123",
        });

        const loginRes = await request(app)
            .post("/graphql")
            .send({
                query: `
                    query Login($email: String!, $password: String!) {
                        login(email: $email, password: $password) {
                            token
                            userId
                        }
                    }
                `,
                variables: {
                    email: "test@test.com",
                    password: "password123",
                },
            });

        const token = loginRes.body.data.login.token;

        const res = await request(app)
            .post("/graphql")
            .set("Authorization", `Bearer ${token}`)
            .send({
                query: `
                    mutation UpdateUser($userInput: UpdateUserInputData!) {
                        updateUser(userInput: $userInput) {
                            _id
                            name
                            email
                        }
                    }
                `,
                variables: {
                    userInput: {
                        name: "Ahmed Toba",
                        email: "newtest@test.com",
                    },
                },
            });
        expect(res.status).to.equal(200);
        expect(res.body.data.updateUser).to.have.property("name", "Ahmed Toba");
        expect(res.body.data.updateUser).to.have.property(
            "email",
            "newtest@test.com",
        );
        expect(res.body.data.updateUser).to.have.property("_id");
    });
    it("Should get user fails when user is not authenticated", async () => {
        const res = await request(app)
            .post("/graphql")
            .send({
                query: `
                    query {
                        getUser {
                            _id
                            name
                            email
                        }
                    }
                `,
            });
        expect(res.status).to.equal(200);
        expect(res.body.errors).to.have.lengthOf(1);
        expect(res.body.errors[0].message).to.equal("Not authenticated!");
        expect(res.body.errors[0].extensions.statusCode).to.equal(401);
    });
    it("Should Update user fail when user not authenticated", async () => {
        const res = await request(app)
            .post("/graphql")
            .send({
                query: `
                    mutation UpdateUser($userInput: UpdateUserInputData!) {
                        updateUser(userInput: $userInput) {
                            _id
                            name
                            email
                        }
                    }
                `,
                variables: {
                    userInput: {
                        name: "Ahmed Toba",
                        email: "newtest@test.com",
                    },
                },
            });
        expect(res.status).to.equal(200);
        expect(res.body.errors).to.have.lengthOf(1);
        expect(res.body.errors[0].message).to.equal("Not authenticated!");
        expect(res.body.errors[0].extensions.statusCode).to.equal(401);
    });
});
