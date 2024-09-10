import { DataSource } from "typeorm";
import * as dotenv from 'dotenv'
dotenv.config();

export const AppSource = new DataSource({
  type: process.env.DB_TYPE as "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  database:process.env.DD_NAME,
  entities: [],
  migrations: [],
  logging: false,
  synchronize: true,
});
