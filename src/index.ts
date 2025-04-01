import dotenv from "dotenv";
import dbConnection from "./config/database";

// Load environment variables
dotenv.config();

import app from "./app";

// connect DB
dbConnection();

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(` Server is running at http://localhost:${port}`);
});

// Handle rejection outside express

process.on("unhandledRejection", (error: Error) => {
  console.log(`unhandledRejection Errors ${error.name} || ${error.message}`);
  server.close(() => {
    console.log("Shutting down ... ");
    process.exit(-1);
  });
});
