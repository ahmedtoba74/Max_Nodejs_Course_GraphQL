import { expect } from "chai";
import request from "supertest";
import app from "../../../app.js";
import User from "../../../src/modules/user/user.model.js";

describe("Auth GraphQL E2E Suite", () => {
    it("mutation createUser should create a user and return user selection set", async () => {
        const graphqlQuery = `
            mutation CreateUser($userInput: UserInputData!) {
                createUser(userInput: $userInput) {
                    _id
                    name
                    email
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .send({
                query: graphqlQuery,
                variables: {
                    userInput: {
                        name: "Ahmed Toba",
                        email: "e2e_signup@test.com",
                        password: "password123",
                    },
                },
            });

        expect(res.status).to.equal(200);
        expect(res.body.data.createUser).to.have.property(
            "email",
            "e2e_signup@test.com",
        );
        expect(res.body.data.createUser).to.have.property("name", "Ahmed Toba");
        expect(res.body.data.createUser).to.have.property("_id");
    });

    it("mutation createUser should return 400 error when email already exists", async () => {
        await User.create({
            name: "Existing User",
            email: "dup@test.com",
            password: "password123",
        });

        const graphqlQuery = `
            mutation CreateUser($userInput: UserInputData!) {
                createUser(userInput: $userInput) {
                    _id
                    name
                    email
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .send({
                query: graphqlQuery,
                variables: {
                    userInput: {
                        name: "Duplicate User",
                        email: "dup@test.com",
                        password: "password123",
                    },
                },
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0].message).to.equal("User already exists");
        expect(res.body.errors[0].extensions.statusCode).to.equal(400);
    });

    it("query login should authenticate user and set HTTP cookie", async () => {
        await User.create({
            name: "Ahmed Toba",
            email: "e2e_login@test.com",
            password: "password123",
        });

        const graphqlQuery = `
            query Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                    userId
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .send({
                query: graphqlQuery,
                variables: {
                    email: "e2e_login@test.com",
                    password: "password123",
                },
            });

        expect(res.status).to.equal(200);
        expect(res.body.data.login).to.have.property("token");
        expect(res.body.data.login).to.have.property("userId");
        expect(res.headers["set-cookie"]).to.exist;
    });

    it("query login should return 401 error for invalid credentials", async () => {
        const graphqlQuery = `
            query Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                    userId
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .send({
                query: graphqlQuery,
                variables: {
                    email: "nonexistent@test.com",
                    password: "wrongPassword",
                },
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0].message).to.equal(
            "Invalid email or password",
        );
        expect(res.body.errors[0].extensions.statusCode).to.equal(401);
    });

    it("mutation logout should return true and clear cookie", async () => {
        const graphqlQuery = `
            mutation {
                logout
            }
        `;

        const res = await request(app).post("/graphql").send({
            query: graphqlQuery,
        });

        expect(res.status).to.equal(200);
        expect(res.body.data.logout).to.be.true;
        expect(res.headers["set-cookie"]).to.exist;
    });
});
