export const authTypeDefs = `
    type AuthData {
        token: String!
        userId: String!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }
`;
