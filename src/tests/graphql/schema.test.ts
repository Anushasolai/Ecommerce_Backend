import { ApolloServer } from "apollo-server";
import { gql } from "apollo-server";
import { typeDefs } from "../../graphql/schema";
import { resolvers } from "../../graphql/resolvers";
import { AppSource } from "../../config/ormconfig";
import { Repository } from "typeorm";
import { Product } from "../../entities/ProductEntity";

const GET_PRODUCTS_QUERY = gql`
  query {
    products {
      products {
        id
        title
        category
        price
        rating
        image
      }
      total
    }
  }
`;

let server: ApolloServer;

const mockProductRepository = {
  findAndCount: jest.fn() as jest.MockedFunction<
    typeof mockProductRepository.findAndCount
  >,
} as unknown as Repository<Product>;

beforeAll(async () => {
  if (!AppSource.isInitialized) {
    await AppSource.initialize();
  }

  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      productRepository: mockProductRepository,
    }),
  });
});

afterAll(async () => {
  if (AppSource.isInitialized) {
    await AppSource.destroy();
  }
});

test("should return a list of products", async () => {
  const mockProducts = [
    {
      id: "2",
      title: "Eyeshadow Palette with Mirror",
      category: "beauty",
      price: 19.99,
      rating: 3.28,
      image: "",
    },
  ];

  (mockProductRepository.findAndCount as jest.Mock).mockResolvedValue([
    mockProducts,
    1,
  ]);

  const response = await server.executeOperation({
    query: GET_PRODUCTS_QUERY,
  });

  const { data, errors } = response;

  expect(errors).toBeUndefined();
  expect(data?.products).toBeDefined();
  expect(data?.products.products).toBeDefined();
  expect(Array.isArray(data?.products.products)).toBe(true);
  expect(data?.products.products[0]).toMatchObject(mockProducts[0]);
  expect(data?.products.total).toBe(1); 
});
