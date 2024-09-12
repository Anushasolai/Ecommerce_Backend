import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Product } from "../entities/ProductEntity";
dotenv.config();

export const AppSource = new DataSource({
  type: process.env.DATABASE_TYPE as "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432", 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Product],
  synchronize: true,
  logging: false,
});
