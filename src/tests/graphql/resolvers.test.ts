import { resolvers } from "../../graphql/resolvers";
import { Product } from "../../entities/ProductEntity";
import { AppSource } from "../../config/ormconfig";
import axios from "axios";
import { Repository } from "typeorm";

jest.mock("axios");

const EXTERNAL_API_URL = "https://dummyjson.com/products";

const productRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<Repository<Product>>;

const mockProduct = {
  id: 5,
  title: "Test Product",
  category: "Test Category",
  price: 100,
  rating: 4.5,
  image: "",
};

const mockProductWithImage = {
  ...mockProduct,
  image: "https://example.com/default-image.jpg",
};

describe("GraphQL Resolvers", () => {
  beforeAll(async () => {
    await AppSource.initialize();
  });

  afterAll(async () => {
    await AppSource.destroy();
  });

  it("should fetch and store products from external API", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { products: [mockProductWithImage] },
    });

    productRepository.save.mockResolvedValue(mockProductWithImage);

    const result = await resolvers.Mutation.fetchAndStoreProducts(null, null, {
      productRepository,
    });

    expect(axios.get).toHaveBeenCalledWith(EXTERNAL_API_URL);
    expect(productRepository.save).toHaveBeenCalledWith([mockProductWithImage]);
    expect(result).toEqual([mockProductWithImage]);
  });

  it("should fetch and store products with default image if image is null", async () => {
    const productWithNullImage = { ...mockProduct, image: null };

    (axios.get as jest.Mock).mockResolvedValue({
      data: { products: [productWithNullImage] },
    });

    productRepository.save.mockResolvedValue({
      ...productWithNullImage,
      image: "https://example.com/default-image.jpg",
    });

    const result = await resolvers.Mutation.fetchAndStoreProducts(null, null, {
      productRepository,
    });

    expect(axios.get).toHaveBeenCalledWith(EXTERNAL_API_URL);
    expect(productRepository.save).toHaveBeenCalledWith([
      {
        ...productWithNullImage,
        image: "https://example.com/default-image.jpg",
      },
    ]);
    expect(result).toEqual([
      {
        ...productWithNullImage,
        image: "https://example.com/default-image.jpg",
      },
    ]);
  });
});
