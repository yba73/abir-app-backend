import jwt from "jsonwebtoken";
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res
        .status(401)
        .json({ message: "you are not authorized no token", status: "fail" });
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error)
        return res.status(401).json({
          message: "you are not authorized, invalid token",
          status: "fail",
        });
      else {
        req.user = decoded;
        next();

        return decoded;
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", status: "fail" });
    throw new Error(`authMiddleware error is ${error}`);
  }
};
export default authMiddleware;
