import { checkConnection } from "../index";
import { AppSource } from "../config/ormconfig"; 

beforeAll(async () => {
  if (!AppSource.isInitialized) {
    await AppSource.initialize();
  }
});

afterAll(async () => {
  if (AppSource.isInitialized) {
    await AppSource.destroy();
  }
});

describe("checkConnection", () => {
  it("should establish a database connection successfully", async () => {
    await expect(checkConnection()).resolves.not.toThrow();
  });
});
