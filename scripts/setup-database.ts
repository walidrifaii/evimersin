import { loadEnv, setupDatabase } from "./load-env";

loadEnv();

setupDatabase().catch((error) => {
  console.error("Failed to setup database:", error);
  process.exit(1);
});
