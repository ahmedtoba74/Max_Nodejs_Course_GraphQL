export const userTypeDefs = `
    type User {
            _id: ID!
            name: String!
            email: String!
            status: String!
            posts: [Posts!]!
        }

    input UpdateUserInputData {
        status: String
        name: String
        email: String
    }
`;

export const userQueries = `
    getUser: User!
`;

export const userMutations = `
    updateUser(userInput: UpdateUserInputData!): User!
`;
