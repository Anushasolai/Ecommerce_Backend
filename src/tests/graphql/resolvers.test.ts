jest.mock("../../graphql/jwtmiddleware", () => ({
  verifyToken: jest.fn().mockReturnValue({ userId: 1 }),
}));

import { resolvers } from "../../graphql/resolvers";
import { Product } from "../../entities/ProductEntity";
import { Repository } from "typeorm";
import axios from "axios";

jest.mock("axios");

describe("GraphQL Resolvers", () => {
  let productRepository: Repository<Product>;

  beforeEach(() => {
    productRepository = {
      save: jest.fn(),
      findOneBy: jest.fn(),
      findAndCount: jest.fn(),
    } as unknown as Repository<Product>;
  });

  describe("fetchAndStoreProducts", () => {
    it("should fetch and store products successfully", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          products: [
            {
              id: 1,
              title: "Test Product 1",
              category: "Category 1",
              price: 100,
              rating: 4.5,
              images: ["image1.jpg"],
            },
          ],
        },
      });

      const result = await resolvers.Mutation.fetchAndStoreProducts(
        null,
        {},
        { productRepository, token: "valid-token" }
      );

      expect(axios.get).toHaveBeenCalledWith("https://dummyjson.com/products");
      expect(productRepository.save).toHaveBeenCalledWith([
        {
          id: 1,
          title: "Test Product 1",
          category: "Category 1",
          price: 100,
          rating: 4.5,
          image: "image1.jpg",
        },
      ]);
      expect(result).toEqual([
        {
          id: 1,
          title: "Test Product 1",
          category: "Category 1",
          price: 100,
          rating: 4.5,
          image: "image1.jpg",
        },
      ]);
    });

    it("should handle API errors gracefully", async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      await expect(
        resolvers.Mutation.fetchAndStoreProducts(
          null,
          {},
          { productRepository, token: "valid-token" }
        )
      ).rejects.toThrow("Failed to fetch and store products");
    });

    it("should use default image if image is null", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          products: [
            {
              id: 2,
              title: "Test Product 2",
              category: "Category 2",
              price: 200,
              rating: 4.0,
              images: [],
            },
          ],
        },
      });

      const result = await resolvers.Mutation.fetchAndStoreProducts(
        null,
        {},
        { productRepository, token: "valid-token" }
      );

      expect(productRepository.save).toHaveBeenCalledWith([
        {
          id: 2,
          title: "Test Product 2",
          category: "Category 2",
          price: 200,
          rating: 4.0,
          image: "https://example.com/default-image.jpg",
        },
      ]);
      expect(result).toEqual([
        {
          id: 2,
          title: "Test Product 2",
          category: "Category 2",
          price: 200,
          rating: 4.0,
          image: "https://example.com/default-image.jpg",
        },
      ]);
    });
  });
});
