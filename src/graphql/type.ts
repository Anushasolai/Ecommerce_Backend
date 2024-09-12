import { Product } from "../entities/ProductEntity";

export type Query = {
  products: (category?: string, searchText?: string) => Product[]; 
  product: (id: string | number) => Product;
};

export type Mutation = {
  fetchAndStoreProducts: () => Product[];  
  createProduct: (title: string, category: string, price: number, rating: number, image: string) => Product;
  updateProduct: (id: string | number, title?: string, category?: string, price?: number, rating?: number, image?: string) => Product;
  deleteProduct: (id: string | number) => boolean;
};
