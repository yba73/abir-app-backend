import mongoose from "mongoose";
const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: "invalid id", status: false });
  next();
};
export default validateObjectId;
