import { Product } from "../entities/ProductEntity";
import { AppSource } from "../config/ormconfig";
import axios from "axios";

export const resolvers = {
  Query: {
    products: async (
      _: any,
      { category, searchText }: { category?: string; searchText?: string }
    ) => {
      const productRepository = AppSource.getRepository(Product);
      let query = productRepository.createQueryBuilder("product");

      if (category) {
        query = query.where("product.category = :category", { category });
      }

      if (searchText) {
        query = query.andWhere("LOWER(product.title) LIKE :searchText", {
          searchText: `%${searchText.toLowerCase()}%`,
        });
      }

      return await query.getMany();
    },

    product: async (_: any, { id }: { id: number }) => {
      const productRepository = AppSource.getRepository(Product);
      return await productRepository.findOneBy({ id });
    },
  },
  Mutation: {
    fetchAndStoreProducts: async () => {
      const productRepository = AppSource.getRepository(Product);

      try {
        const response = await axios.get("https://dummyjson.com/products");
        const products = response.data.products;

        const transformedProducts = products.map((product: any) => ({
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          rating: product.rating,
          image: product.images[0],
        }));

        await productRepository.save(transformedProducts);

        return transformedProducts;
      } catch (error) {
        console.error("Error fetching and storing products:", error);
        throw new Error("Failed to fetch and store products");
      }
    },
    createProduct: async (
      _: any,
      {
        title,
        category,
        price,
        rating,
        image,
      }: {
        title: string;
        category: string;
        price: number;
        rating: number;
        image: string;
      }
    ) => {
      try {
        const productRepository = AppSource.getRepository(Product);

        const product = productRepository.create({
          title,
          category,
          price,
          rating,
          image,
        });

        await productRepository.save(product);
        return product;
      } catch (error) {
        console.error("Error creating product:", error);
        throw new Error("Failed to create product");
      }
    },
    updateProduct: async (
      _: any,
      {
        id,
        title,
        category,
        price,
        rating,
        image,
      }: {
        id: number;
        title?: string;
        category?: string;
        price?: number;
        rating?: number;
        image?: string;
      }
    ) => {
      const productRepository = AppSource.getRepository(Product);
      let product = await productRepository.findOneBy({ id });

      if (!product) {
        console.error(`Product with ID ${id} not found`);
        throw new Error("Product not found");
      }

      if (title !== undefined) product.title = title;
      if (category !== undefined) product.category = category;
      if (price !== undefined) product.price = price;
      if (rating !== undefined) product.rating = rating;
      if (image !== undefined) product.image = image;

      await productRepository.save(product);
      return product;
    },
    deleteProduct: async (_: any, { id }: { id: number }) => {
      const productRepository = AppSource.getRepository(Product);
      const result = await productRepository.delete(id);
      return result.affected !== 0;
    },
  },
};
