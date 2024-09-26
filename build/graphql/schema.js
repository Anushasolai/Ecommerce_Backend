"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql) `
  type User {
    id: ID!
    role: String!
    name: String!
    password: String!
  }

  type AuthPayload {
    token: String!
  }

  type Product {
    id: ID!
    title: String!
    category: String!
    price: Float!
    rating: Float!
    image: String!
  }

  type ProductPage {
    products: [Product!]!
    total: Int!
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
  }

  type Cart {
    id: ID!
    user: User!
    cartItems: [CartItem!]!
  }

  type Query {
    products(category: String, page: Int, limit: Int): ProductPage
    product(id: ID!): Product
    cart(id: ID!): Cart
  }

  type Mutation {
    registerUser(role: String!, name: String!, password: String!): User
    loginUser(name: String!, password: String!): AuthPayload
    fetchAndStoreProducts: [Product!]!
   
     createProduct(
    title: String!
    category: String!
    price: Float!
    rating: Float!
    image: String!
  ): Product!

    updateProduct(
      id: ID!
      title: String
      category: String
      price: Float
      rating: Float
      image: String
    ): Product
    deleteProduct(id: ID!): Boolean
    addItemToCart(userId: ID!, productId: ID!, quantity: Int!): Cart!
  }
`;
//# sourceMappingURL=schema.js.map