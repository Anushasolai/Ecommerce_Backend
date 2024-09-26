"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtmiddleware_1 = require("./jwtmiddleware");
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const EXTERNAL_API_URL = "https://dummyjson.com/products";
exports.resolvers = {
    Query: {
        async products(_, { category, page = 1, limit = 10 }, context) {
            try {
                if (context.token) {
                    const decoded = (0, jwtmiddleware_1.verifyToken)(context.token);
                    console.log('User Info:', decoded);
                }
                const [products, total] = await context.productRepository.findAndCount({
                    where: { category },
                    skip: (page - 1) * limit,
                    take: limit,
                });
                return { products, total };
            }
            catch (error) {
                console.error("Error fetching products by category:", error);
                throw new Error("Failed to fetch products");
            }
        },
        async product(_, { id }, context) {
            try {
                if (context.token) {
                    const decoded = (0, jwtmiddleware_1.verifyToken)(context.token);
                    console.log('User Info:', decoded);
                }
                const product = await context.productRepository.findOneBy({ id });
                if (!product)
                    throw new Error("Product not found");
                return product;
            }
            catch (error) {
                console.error("Error fetching product by ID:", error);
                throw new Error("Failed to fetch product");
            }
        },
        async cart(_, { id }, { cartRepository }) {
            try {
                const cart = await cartRepository.findOne({
                    where: { id },
                    relations: ['cartItems', 'cartItems.product'],
                });
                if (!cart) {
                    throw new Error("Cart not found");
                }
                return cart;
            }
            catch (error) {
                console.error("Error fetching cart:", error);
                throw new Error("Failed to fetch cart");
            }
        },
    },
    Mutation: {
        async registerUser(_, { role, name, password }, { userRepository }) {
            try {
                const existingUser = await userRepository.findOneBy({ name });
                if (existingUser)
                    throw new Error("User already exists");
                const hashedPassword = await bcrypt_1.default.hash(password, 10);
                const user = userRepository.create({ role, name, password: hashedPassword });
                await userRepository.save(user);
                return user;
            }
            catch (error) {
                console.error("Error registering user:", error);
                throw new Error("Failed to register user");
            }
        },
        async loginUser(_, { name, password }, { userRepository }) {
            try {
                const user = await userRepository.findOneBy({ name });
                if (!user)
                    throw new Error("User not found");
                const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
                if (!isPasswordValid)
                    throw new Error("Invalid password");
                const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
                return { token };
            }
            catch (error) {
                console.error("Error logging in user:", error);
                throw new Error("Failed to login user: " + error);
            }
        },
        addItemToCart: async (_, { userId, productId, quantity }, context) => {
            const { userRepository, productRepository, cartRepository, cartItemRepository } = context;
            try {
                // Fetch the user by ID
                const user = await userRepository.findOne({ where: { id: userId } });
                if (!user) {
                    throw new Error("User not found");
                }
                // Fetch the product by ID
                const product = await productRepository.findOne({ where: { id: productId } });
                if (!product) {
                    throw new Error("Product not found");
                }
                // Check if the user already has a cart
                let cart = await cartRepository.findOne({ where: { user: { id: userId } }, relations: ["cartItems"] });
                if (!cart) {
                    // Create a new cart if the user doesn't have one
                    cart = cartRepository.create({ user });
                    await cartRepository.save(cart);
                }
                // Initialize cartItems array if it doesn't exist
                if (!cart.cartItems) {
                    cart.cartItems = [];
                }
                // Check if the product already exists in the cart
                let cartItem = cart.cartItems.find((item) => item.product.id === productId);
                if (cartItem) {
                    // If item exists, update the quantity
                    cartItem.quantity += quantity;
                }
                else {
                    // If item doesn't exist, add it to the cart
                    cartItem = cartItemRepository.create({
                        cart,
                        product,
                        quantity,
                    });
                    cart.cartItems.push(cartItem);
                }
                // Save the cart and return it
                await cartItemRepository.save(cartItem);
                await cartRepository.save(cart);
                return cart;
            }
            catch (error) {
                console.error("Failed to add item to cart:", error);
                throw new Error("Failed to add item to cart");
            }
        },
        async fetchAndStoreProducts(_, args, // You can remove this if unused
        { productRepository, token }) {
            try {
                if (token) {
                    const decoded = (0, jwtmiddleware_1.verifyToken)(token);
                    console.log('User Info:', decoded);
                }
                const response = await axios_1.default.get(EXTERNAL_API_URL);
                const products = response.data.products || [];
                const transformedProducts = products.map(product => ({
                    id: product.id,
                    title: product.title,
                    category: product.category,
                    price: product.price,
                    rating: product.rating,
                    image: product.images[0] || "https://example.com/default-image.jpg",
                }));
                await productRepository.save(transformedProducts);
                return transformedProducts;
            }
            catch (error) {
                console.error("Error fetching and storing products:", error);
                throw new Error("Failed to fetch and store products");
            }
        },
        async createProduct(_, { title, category, price, rating, image }, context) {
            try {
                if (context.token) {
                    const decoded = (0, jwtmiddleware_1.verifyToken)(context.token);
                    if (decoded.role !== 'admin')
                        throw new Error('Unauthorized');
                }
                else {
                    throw new Error('No token provided');
                }
                const product = context.productRepository.create({
                    title,
                    category,
                    price,
                    rating,
                    image,
                });
                await context.productRepository.save(product);
                return product;
            }
            catch (error) {
                console.error("Error creating product:", error);
                throw new Error("Failed to create product");
            }
        },
        async updateProduct(_, { id, title, category, price, rating, image }, context) {
            try {
                if (context.token) {
                    const decoded = (0, jwtmiddleware_1.verifyToken)(context.token);
                    if (decoded.role !== 'admin')
                        throw new Error('Unauthorized');
                }
                else {
                    throw new Error('No token provided');
                }
                const product = await context.productRepository.findOneBy({ id });
                if (!product)
                    throw new Error("Product not found");
                Object.assign(product, { title, category, price, rating, image });
                await context.productRepository.save(product);
                return product;
            }
            catch (error) {
                console.error("Error updating product:", error);
                throw new Error("Failed to update product");
            }
        },
        async deleteProduct(_, { id }, context) {
            try {
                if (context.token) {
                    const decoded = (0, jwtmiddleware_1.verifyToken)(context.token);
                    if (decoded.role !== 'admin')
                        throw new Error('Unauthorized');
                }
                else {
                    throw new Error('No token provided');
                }
                const result = await context.productRepository.delete({ id });
                return result.affected ? true : false;
            }
            catch (error) {
                console.error("Error deleting product:", error);
                throw new Error("Failed to delete product");
            }
        }
    }
};
// import axios from "axios";
// import { Repository } from "typeorm";
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { verifyToken } from "./jwtmiddleware";
// import { Product } from "../entities/ProductEntity";
// import { User } from "../entities/UserEntity";
// import { Cart } from "../entities/CartEntity";
// const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
// const EXTERNAL_API_URL = "https://dummyjson.com/products";
// // Define an external product interface
// interface ExternalProduct {
//   id: number;
//   title: string;
//   category: string;
//   price: number;
//   rating: number;
//   images: string[];
// }
// export const resolvers = {
//     Query: {
//     async products(
//       _: any,
//       { category, page = 1, limit = 10 }: { category?: string; page?: number; limit?: number },
//       context: { productRepository: Repository<Product>; token?: string }
//     ) {
//       try {
//         if (context.token) {
//           const decoded = verifyToken(context.token);
//           console.log('User Info:', decoded);
//         }
//         const [products, total] = await context.productRepository.findAndCount({
//           where: { category },
//           skip: (page - 1) * limit,
//           take: limit,
//         });
//         return { products, total };
//       } catch (error) {
//         console.error("Error fetching products by category:", error);
//         throw new Error("Failed to fetch products");
//       }
//     },
//     async product(
//       _: any,
//       { id }: { id: number },
//       context: { productRepository: Repository<Product>; token?: string }
//     ) {
//       try {
//         if (context.token) {
//           const decoded = verifyToken(context.token);
//           console.log('User Info:', decoded);
//         }
//         const product = await context.productRepository.findOneBy({ id });
//         if (!product) throw new Error("Product not found");
//         return product;
//       } catch (error) {
//         console.error("Error fetching product by ID:", error);
//         throw new Error("Failed to fetch product");
//       }
//     },
//     async cart(
//       _: any,
//       { id }: { id: number },
//       { cartRepository }: { cartRepository: Repository<Cart> }
//     ) {
//       try {
//         const cart = await cartRepository.findOne({
//           where: { id },
//           relations: ['cartItems', 'cartItems.product'],
//         });
//         if (!cart) {
//           throw new Error("Cart not found");
//         }
//         return cart;
//       } catch (error) {
//         console.error("Error fetching cart:", error);
//         throw new Error("Failed to fetch cart");
//       }
//     },
//   },
//   Mutation: {
//     async registerUser(
//       _: any,
//       { role, name, password }: { role: string; name: string; password: string },
//       { userRepository }: { userRepository: Repository<User> }
//     ) {
//       try {
//         const existingUser = await userRepository.findOneBy({ name });
//         if (existingUser) throw new Error("User already exists");
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = userRepository.create({ role, name, password: hashedPassword });
//         await userRepository.save(user);
//         return user;
//       } catch (error) {
//         console.error("Error registering user:", error);
//         throw new Error("Failed to register user");
//       }
//     },
//     async loginUser(
//       _: any,
//       { name, password }: { name: string; password: string },
//       { userRepository }: { userRepository: Repository<User> }
//     ) {
//       try {
//         const user = await userRepository.findOneBy({ name });
//         if (!user) throw new Error("User not found");
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) throw new Error("Invalid password");
//         const token = jwt.sign(
//           { userId: user.id, role: user.role },
//           SECRET_KEY,
//           { expiresIn: '1h' }
//         );
//         return { token };
//       } catch (error) {
//         console.error("Error logging in user:", error);
//         throw new Error("Failed to login user: " + error);
//       }
//     },
//     async addItemToCart(
//       _: any,
//       { userId, productId, quantity }: any,
//       { userRepository, productRepository, cartRepository, cartItemRepository }: any
//     ) {
//       try {
//         // Fetch the user by ID
//         const user = await userRepository.findOne({ where: { id: userId } });
//         if (!user) {
//           throw new Error("User not found");
//         }
//         // Fetch the product by ID
//         const product = await productRepository.findOne({ where: { id: productId } });
//         if (!product) {
//           throw new Error("Product not found");
//         }
//         // Check if the user already has a cart
//         let cart = await cartRepository.findOne({ where: { user: { id: userId } }, relations: ["cartItems"] });
//         if (!cart) {
//           // Create a new cart if the user doesn't have one
//           cart = cartRepository.create({ user });
//           await cartRepository.save(cart);
//         }
//         // Initialize cartItems array if it doesn't exist
//         if (!cart.cartItems) {
//           cart.cartItems = [];
//         }
//         // Check if the product already exists in the cart
//         let cartItem = cart.cartItems.find((item: any) => item.product.id === productId);
//         if (cartItem) {
//           // If item exists, update the quantity
//           cartItem.quantity += quantity;
//         } else {
//           // If item doesn't exist, add it to the cart
//           cartItem = cartItemRepository.create({
//             cart,
//             product,
//             quantity,
//           });
//           cart.cartItems.push(cartItem);
//         }
//         // Save the cart and return it
//         await cartItemRepository.save(cartItem);
//         await cartRepository.save(cart);
//         return cart;
//       } catch (error) {
//         console.error("Failed to add item to cart:", error);
//         throw new Error("Failed to add item to cart");
//       }
//     },
//     async fetchAndStoreProducts(
//       _: any,
//       args: any, // You can remove this if unused
//       { productRepository, token }: { productRepository: Repository<Product>; token: string }
//     ) {
//       try {
//         if (token) {
//           const decoded = verifyToken(token);
//           console.log('User Info:', decoded);
//         }
//         const response = await axios.get(EXTERNAL_API_URL);
//         const products: ExternalProduct[] = response.data.products || [];
//         const transformedProducts = products.map(product => ({
//           id: product.id,
//           title: product.title,
//           category: product.category,
//           price: product.price,
//           rating: product.rating,
//           image: product.images[0] || "https://example.com/default-image.jpg",
//         }));
//         await productRepository.save(transformedProducts);
//         return transformedProducts;
//       } catch (error) {
//         console.error("Error fetching and storing products:", error);
//         throw new Error("Failed to fetch and store products");
//       }
//     },
//     async createProduct(
//       _: any,
//       { title, category, price, rating, image }: { title: string; category: string; price: number; rating: number; image: string },
//       context: { productRepository: Repository<Product>; token?: string }
//     ) {
//       try {
//         if (context.token) {
//           const decoded = verifyToken(context.token);
//           if (decoded.role !== 'admin') throw new Error('Unauthorized');
//         } else {
//           throw new Error('No token provided');
//         }
//         const product = context.productRepository.create({
//           title,
//           category,
//           price,
//           rating,
//           image,
//         });
//         await context.productRepository.save(product);
//         return product;
//       } catch (error) {
//         console.error("Error creating product:", error);
//         throw new Error("Failed to create product");
//       }
//     },
//     async updateProduct(
//       _: any,
//       { id, title, category, price, rating, image }: { id: number; title: string; category: string; price: number; rating: number; image: string },
//       context: { productRepository: Repository<Product>; token?: string }
//     ) {
//       try {
//         if (context.token) {
//           const decoded = verifyToken(context.token);
//           if (decoded.role !== 'admin') throw new Error('Unauthorized');
//         } else {
//           throw new Error('No token provided');
//         }
//         const product = await context.productRepository.findOneBy({ id });
//         if (!product) throw new Error("Product not found");
//         Object.assign(product, { title, category, price, rating, image });
//         await context.productRepository.save(product);
//         return product;
//       } catch (error) {
//         console.error("Error updating product:", error);
//         throw new Error("Failed to update product");
//       }
//     },
//     async deleteProduct(
//       _: any,
//       { id }: { id: number },
//       context: { productRepository: Repository<Product>; token?: string }
//     ) {
//       try {
//         if (context.token) {
//           const decoded = verifyToken(context.token);
//           if (decoded.role !== 'admin') throw new Error('Unauthorized');
//         } else {
//           throw new Error('No token provided');
//         }
//         const result = await context.productRepository.delete({ id });
//         return result.affected ? true : false;
//       } catch (error) {
//         console.error("Error deleting product:", error);
//         throw new Error("Failed to delete product");
//       }
//     }
//   }
// };
//# sourceMappingURL=resolvers.js.map