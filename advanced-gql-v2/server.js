const { ApolloServer, PubSub } = require("apollo-server");
const gql = require("graphql-tag");

const pubSub = new PubSub();
const NEW_ITEM = "NEW_ITEM";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    error: String
    createdAt: Int!
  }
  type Settings {
    user: User!
    theme: String
  }

  type Item {
    task: String!
  }

  input NewSettingsInput {
    user: ID!
    theme: String!
  }

  type Query {
    me: User!
    settings(user: ID!): Settings!
  }

  type Mutation {
    settings(input: NewSettingsInput!): Settings!
    createItem(task: String!): Item!
  }

  type Subscription {
    newItem: Item
  }
`;

const resolvers = {
  Query: {
    me() {
      return {
        id: 1,
        username: "hggonzalez",
        createdAt: "122454546",
      };
    },
    settings(_, { user }) {
      return {
        user,
        theme: "Light",
      };
    },
  },
  Mutation: {
    settings(_, { input }) {
      return input;
    },
    createItem(_, { task }) {
      const item = { task };
      pubSub.publish(NEW_ITEM, { newItem: item });
      return item;
    },
  },
  Subscription: {
    newItem: {
      subscribe: () => pubSub.asyncIterator(NEW_ITEM),
    },
  },
  Settings: {
    user() {
      return {
        id: 1,
        username: "hggonzalez",
        createdAt: "122454546",
      };
    },
  },
  User: {
    error() {
      throw new Error("You cant do this");
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError(error) {
    console.log(error);
    // return new Error('This is a custom error');
    return error;
  },
  context({ connection, req }) {
    if (connection) {
      return { ...connection.context };
    }
  },
  subscriptions: {
    onConnect(params) {},
  },
});

server.listen().then(({ url }) => console.log(`server at ${url}`));
