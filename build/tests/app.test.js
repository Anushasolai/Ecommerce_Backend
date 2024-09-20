"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const schema_1 = require("../graphql/schema");
const resolvers_1 = require("../graphql/resolvers");
const server = new apollo_server_1.ApolloServer({
    typeDefs: schema_1.typeDefs,
    resolvers: resolvers_1.resolvers,
});
beforeAll(async () => {
    await server.listen({ port: 4000 });
});
afterAll(async () => {
    await server.stop();
});
test('should start and stop server successfully', async () => {
    expect(server).toBeDefined();
});
//# sourceMappingURL=app.test.js.map