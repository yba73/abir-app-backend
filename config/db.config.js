import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO, {
      bufferCommands: false,
    });
    console.log("data base connected successfully");
  } catch (error) {
    throw new Error(`error to connect to database is ${error}`);
  }
};

export default connectDB;
