import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Product {
    id: ID
    title: String
    category: String
    price: Float
    rating: Float
    image: String
  }

  type Query {
    products(category: String, searchText: String): [Product]
    product(id: ID!): Product
  }

  type Mutation {
    fetchAndStoreProducts: [Product]
    createProduct(
      title: String!
      category: String!
      price: Float!
      rating: Float!
      image: String!
    ): Product
    updateProduct(
      id: ID!
      title: String
      category: String
      price: Float
      rating: Float
      image: String
    ): Product
    deleteProduct(id: ID!): Boolean
  }
`;
