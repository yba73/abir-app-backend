import express from "express";
import {
  test,
  updateUser,
  deleteUser,
  getUsers,
  getUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validateObjectId from "../middlewares/validate.objectId.middleware.js";

const router = express.Router();

router.get("/test", test);
router.get("/", getUsers);
router.get("/:id", validateObjectId, getUser);

router.post("/update/:id", verifyToken, authMiddleware, updateUser);
router.put("/:id", validateObjectId, authMiddleware, updateUser);

router.delete("/:id", validateObjectId, authMiddleware, deleteUser);

export default router;
