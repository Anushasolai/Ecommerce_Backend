import { ApolloServer } from 'apollo-server';
import { typeDefs } from '../graphql/schema';
import { resolvers } from '../graphql/resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
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
