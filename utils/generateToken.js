import jwt from "jsonwebtoken";

const generateToken = (id, expirationTime, role = "user") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: expirationTime,
  });
};
export default generateToken;
