import mongoose from "mongoose";

const dbConnection = async () => {
  const conn = await mongoose.connect(process.env.DB_URI as string);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
export default dbConnection;
