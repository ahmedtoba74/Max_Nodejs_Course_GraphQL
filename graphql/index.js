import { buildSchema } from "graphql";
import { authTypeDefs } from "../src/modules/auth/auth.schema.js";
import { authResolvers } from "../src/modules/auth/auth.resolver.js";
import { userTypeDefs } from "../src/modules/user/user.schema.js";
import { userResolvers } from "../src/modules/user/user.resolver.js";

// Combine type definitions and root schemas cleanly
export const schema = buildSchema(`
    type Posts {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        status: String!
        posts: [Posts!]!
    }

    ${authTypeDefs}
    ${userTypeDefs}

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        getUser: User!
    }

    type RootMutation {
        createUser(userInput: UserInputData!): User!
        updateUser(userInput: UpdateUserInputData!): User!
        logout: Boolean!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

// Combine modular resolvers
export const resolvers = {
    ...authResolvers,
    ...userResolvers,
};

export default { schema, resolvers };
