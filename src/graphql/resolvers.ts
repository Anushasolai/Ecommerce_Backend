import axios from "axios";
import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "./jwtmiddleware";
import { Product } from "../entities/ProductEntity";
import { User } from "../entities/UserEntity";
import { Cart } from "../entities/CartEntity";

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";
const EXTERNAL_API_URL = "https://dummyjson.com/products";

interface ExternalProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  images: string[];
}

export const resolvers = {
  Query: {
    async products(
      _: any,
      {
        category,
        page = 1,
        limit = 10,
      }: { category?: string; page?: number; limit?: number },
      context: { productRepository: Repository<Product>; token?: string }
    ) {
      try {
        if (context.token) {
          const decoded = verifyToken(context.token);
          console.log("User Info:", decoded);
        }

        const [products, total] = await context.productRepository.findAndCount({
          where: { category },
          skip: (page - 1) * limit,
          take: limit,
        });
        return { products, total };
      } catch (error) {
        console.error("Error fetching products by category:", error);
        throw new Error("Failed to fetch products");
      }
    },

    async product(
      _: any,
      { id }: { id: number },
      context: { productRepository: Repository<Product>; token?: string }
    ) {
      try {
        if (context.token) {
          const decoded = verifyToken(context.token);
          console.log("User Info:", decoded);
        }

        const product = await context.productRepository.findOneBy({ id });
        if (!product) throw new Error("Product not found");
        return product;
      } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw new Error("Failed to fetch product");
      }
    },

    async cart(
      _: any,
      { id }: { id: number },
      { cartRepository }: { cartRepository: Repository<Cart> }
    ) {
      try {
        const cart = await cartRepository.findOne({
          where: { id },
          relations: ["cartItems", "cartItems.product"],
        });

        if (!cart) {
          throw new Error("Cart not found");
        }

        return cart;
      } catch (error) {
        console.error("Error fetching cart:", error);
        throw new Error("Failed to fetch cart");
      }
    },
  },

  Mutation: {
    async registerUser(
      _: any,
      {
        role,
        name,
        password,
      }: { role: string; name: string; password: string },
      { userRepository }: { userRepository: Repository<User> }
    ) {
      try {
        const existingUser = await userRepository.findOneBy({ name });
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create({
          role,
          name,
          password: hashedPassword,
        });
        await userRepository.save(user);
        return user;
      } catch (error) {
        console.error("Error registering user:", error);
        throw new Error("Failed to register user");
      }
    },

    async loginUser(
      _: any,
      { name, password }: { name: string; password: string },
      { userRepository }: { userRepository: Repository<User> }
    ) {
      try {
        const user = await userRepository.findOneBy({ name });
        if (!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        const token = jwt.sign(
          { userId: user.id, role: user.role },
          SECRET_KEY,
          { expiresIn: "1h" }
        );

        return { token };
      } catch (error) {
        console.error("Error logging in user:", error);
        throw new Error("Failed to login user: " + error);
      }
    },

    addItemToCart: async (
      _: any,
      { userId, productId, quantity }: any,
      context: any
    ) => {
      const {
        userRepository,
        productRepository,
        cartRepository,
        cartItemRepository,
      } = context;

      try {
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
          throw new Error("User not found");
        }

        const product = await productRepository.findOne({
          where: { id: productId },
        });
        if (!product) {
          throw new Error("Product not found");
        }

        let cart = await cartRepository.findOne({
          where: { user: { id: userId } },
          relations: ["cartItems"],
        });
        if (!cart) {
          cart = cartRepository.create({ user });
          await cartRepository.save(cart);
        }

        if (!cart.cartItems) {
          cart.cartItems = [];
        }

        let cartItem = cart.cartItems.find(
          (item: any) => item.product.id === productId
        );
        if (cartItem) {
          cartItem.quantity += quantity;
        } else {
          cartItem = cartItemRepository.create({
            cart,
            product,
            quantity,
          });
          cart.cartItems.push(cartItem);
        }

        await cartItemRepository.save(cartItem);
        await cartRepository.save(cart);

        return cart;
      } catch (error) {
        console.error("Failed to add item to cart:", error);
        throw new Error("Failed to add item to cart");
      }
    },

    async fetchAndStoreProducts(
      _: any,
      args: any,
      {
        productRepository,
        token,
      }: { productRepository: Repository<Product>; token: string }
    ) {
      try {
        if (token) {
          const decoded = verifyToken(token);
          console.log("User Info:", decoded);
        }

        const response = await axios.get(EXTERNAL_API_URL);

        const products: ExternalProduct[] = response.data.products || [];

        const transformedProducts = products.map((product) => ({
          id: product.id,
          title: product.title,
          category: product.category,
          price: product.price,
          rating: product.rating,
          image: product.images[0] || "https://example.com/default-image.jpg",
        }));

        await productRepository.save(transformedProducts);
        return transformedProducts;
      } catch (error) {
        console.error("Error fetching and storing products:", error);
        throw new Error("Failed to fetch and store products");
      }
    },

    async createProduct(
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
      },
      context: { productRepository: Repository<Product>; token?: string }
    ) {
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
        console.error("Error creating product:", error);
        throw new Error("Failed to create product");
      }
    },

    async updateProduct(
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
        title: string;
        category: string;
        price: number;
        rating: number;
        image: string;
      },
      context: { productRepository: Repository<Product>; token?: string }
    ) {
      try {
        if (context.token) {
          const decoded = verifyToken(context.token);
          if (decoded.role !== "admin") throw new Error("Unauthorized");
        } else {
          throw new Error("No token provided");
        }

        const product = await context.productRepository.findOneBy({ id });
        if (!product) throw new Error("Product not found");

        Object.assign(product, { title, category, price, rating, image });
        await context.productRepository.save(product);
        return product;
      } catch (error) {
        console.error("Error updating product:", error);
        throw new Error("Failed to update product");
      }
    },

    async deleteProduct(
      _: any,
      { id }: { id: number },
      context: { productRepository: Repository<Product>; token?: string }
    ) {
      try {
        if (context.token) {
          const decoded = verifyToken(context.token);
          if (decoded.role !== "admin") throw new Error("Unauthorized");
        } else {
          throw new Error("No token provided");
        }

        const result = await context.productRepository.delete({ id });
        return result.affected ? true : false;
      } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Failed to delete product");
      }
    },
  },
};
