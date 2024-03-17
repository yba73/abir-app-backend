import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.handler.js";

export const verifyToken = (req, res, next) => {
  console.log("Cookies:", req.cookies);
  const token = req.cookies.access_token;
  console.log("Token:", token);
  if (!token) {
    return next(errorHandler(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, "Token is not valid!"));

    req.user = user;
    next();
  });
};
