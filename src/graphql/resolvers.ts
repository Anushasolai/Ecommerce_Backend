import axios from "axios";
import { Repository } from "typeorm";
import { Product } from "../entities/ProductEntity";
import { error } from "console";

const EXTERNAL_API_URL = "https://dummyjson.com/products";

export const resolvers = {
  Query: {
    products: async (
      _: any,
      { category }: { category?: string },
      context: { productRepository: Repository<Product> }
    ) => {
      try {
        return await context.productRepository.find({ where: { category } });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching products by category:", {
            message: error.message,
            stack: error.stack,
          });
        } else {
          console.error(
            "Unexpected error fetching products by category:",
            error
          );
        }
        throw new Error("Failed to fetch products");
      }
    },

    product: async (
      _: any,
      { id }: { id: number },
      context: { productRepository: Repository<Product> }
    ) => {
      try {
        const product = await context.productRepository.findOneBy({ id });
        if (!product) throw new Error("Product not found");
        return product;
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching product by ID:", {
            message: error.message,
            stack: error.stack,
          });
        } else {
          console.error("Unexpected error fetching product by ID:", error);
        }
        throw new Error("Failed to fetch product");
      }
    },
  },

  Mutation: {
    fetchAndStoreProducts: async (
      parent: any,
      args: any,
      { productRepository }: { productRepository: Repository<Product> }
    ) => {
      try {
        const response = await axios.get(EXTERNAL_API_URL);
        const products = response.data.products || [];

        const transformedProducts = products.map((product: any) => ({
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          rating: product.rating,
          image:
            product.images && product.images.length > 0
              ? product.images[0]
              : "https://example.com/default-image.jpg",
        }));

        await productRepository.save(transformedProducts);
        return transformedProducts;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching and storing products:", {
            message: error.message,
            stack: error.stack,
            config: (error as any).config,
            response: (error as any).response?.data,
          });
          throw new Error("Failed to fetch and store products");
        } else {
          console.error("An unknown error occurred:", error);
          throw new Error("Failed to fetch and store products");
        }
      }
    },

    createProduct: async (
      _: any,
      { title, category, price, rating, image }: any,
      context: { productRepository: Repository<Product> }
    ) => {
      try {
        const product = context.productRepository.create({
          title,
          category,
          price,
          rating,
          image,
        });
        await context.productRepository.save(product);
        return product;
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error creating product:", {
            message: error.message,
            stack: error.stack,
          });
        } else {
          console.error("Unexpected error creating product:", error);
        }
        throw new Error("Failed to create product");
      }
    },

    updateProduct: async (
      _: any,
      { id, title, category, price, rating, image }: any,
      context: { productRepository: Repository<Product> }
    ) => {
      try {
        const product = await context.productRepository.findOneBy({ id });
        if (!product) throw new Error("Product not found");

        Object.assign(product, { title, category, price, rating, image });
        await context.productRepository.save(product);
        return product;
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error updating product:", {
            message: error.message,
            stack: error.stack,
          });
        } else {
          console.error("Unexpected error updating product:", error);
        }
        throw new Error("Failed to update product");
      }
    },

    deleteProduct: async (
      _: any,
      { id }: { id: number },
      context: { productRepository: Repository<Product> }
    ) => {
      try {
        const result = await context.productRepository.delete({ id });
        return result.affected ? true : false;
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error deleting product:", {
            message: error.message,
            stack: error.stack,
          });
        } else {
          console.error("Unexpected error deleting product:", error);
        }
        throw new Error("Failed to delete product");
      }
    },
  },
};
