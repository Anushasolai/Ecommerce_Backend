import { AppSource } from "./config/ormconfig";

export const checkConnection = async () => {
  try {
    if (!AppSource.isInitialized) {
      console.log("Initializing DataSource...");
      await AppSource.initialize();
      console.log("DataSource Initialized Successfully");
    } else {
      console.log("DataSource already initialized");
    }
  } catch (error) {
    console.error("DataSource not Initialized:", error);
  }
};
