"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const apollo_server_2 = require("apollo-server");
const schema_1 = require("../../graphql/schema");
const resolvers_1 = require("../../graphql/resolvers");
const ormconfig_1 = require("../../config/ormconfig");
const GET_PRODUCTS_QUERY = (0, apollo_server_2.gql) `
  query {
    products {
      id
      title
      category
      price
      rating
      image
    }
  }
`;
let server;
const mockProductRepository = {
    find: jest.fn(),
};
beforeAll(async () => {
    if (!ormconfig_1.AppSource.isInitialized) {
        await ormconfig_1.AppSource.initialize();
    }
    server = new apollo_server_1.ApolloServer({
        typeDefs: schema_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        context: () => ({
            productRepository: mockProductRepository,
        }),
    });
});
afterAll(async () => {
    if (ormconfig_1.AppSource.isInitialized) {
        await ormconfig_1.AppSource.destroy();
    }
});
test('should return a list of products', async () => {
    const mockProducts = [
        {
            id: '2',
            title: 'Eyeshadow Palette with Mirror',
            category: 'beauty',
            price: 19.99,
            rating: 3.28,
            image: '',
        },
    ];
    mockProductRepository.find.mockResolvedValue(mockProducts);
    const response = await server.executeOperation({
        query: GET_PRODUCTS_QUERY,
    });
    const { data, errors } = response;
    expect(errors).toBeUndefined();
    expect(data === null || data === void 0 ? void 0 : data.products).toBeDefined();
    expect(Array.isArray(data === null || data === void 0 ? void 0 : data.products)).toBe(true);
    expect(data === null || data === void 0 ? void 0 : data.products[0]).toMatchObject(mockProducts[0]);
});
//# sourceMappingURL=schema.test.js.map