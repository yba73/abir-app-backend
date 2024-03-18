import express from "express";
import {
  signin,
  signup,
  google,
  signout,
  sendforgotPassword,
  createNewPassword,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validateObjectId from "../middlewares/validate.objectId.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.post("/signout", authMiddleware, signout);
router.put("/forgot-password", sendforgotPassword);
router.put(
  "/password-reset/:id",
  authMiddleware,
  validateObjectId,
  createNewPassword
);
export default router;
