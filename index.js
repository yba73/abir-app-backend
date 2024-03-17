import express from "express";

import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import coonectDB from "./config/db.config.js";
dotenv.config();
coonectDB();
// mongoose
//   .connect(process.env.MONGO)
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const __dirname = path.resolve();

const app = express();
app.use(cors()); // Add this line to enable CORS

app.use(express.json()); //allow json as input to the backend

app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes); // middleware for error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
app.use("*", (req, res) => {
  res
    .status(404)
    .json({ message: "page nout found 404, bad url", status: false });
});
app.listen(process.env.PORT || 3001, () => {
  console.log(`Server listening on port ${process.env.PORT || "3001"}`);
});
