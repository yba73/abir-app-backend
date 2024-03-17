import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.handler.js";
import jwt from "jsonwebtoken";
import expirationTime from "../utils/generateToken.js";
import {
  valdiateLogin,
  valdiateRegister,
} from "../validations/users.schemas.js";

/**
 * @desc create new user
 * @params POST /api/auth/signup
 * @access PUBLIC
 **/
export const signup = async (req, res, next) => {
  const { username, email, password, firstname, lastname } = req.body;
  // validate regiseter schema
  const { error } = valdiateRegister(req.body);
  if (error) return next(errorHandler(400, `${error.details[0].message}`));
  // check user already exists
  const existUser = await User.find({ $or: [{ email }, { username }] });
  if (existUser.length) return next(errorHandler(409, "user already exists"));
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    firstname,
    lastname,
  });
  try {
    await newUser.save();
    return res
      .status(201)
      .json({ message: "User created successfully", status: true });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc create new user
 * @params POST /api/auth/signin
 * @access PUBLIC
 **/
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  // validate login schema
  const { error } = valdiateLogin(req.body);
  if (error) return next(errorHandler(400, `${error.details[0].message}`));
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User Not Found"));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong Credentials"));
    // const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const token = expirationTime(validUser._id, "1h");
    const { password: hashedPassword, ...rest } = validUser._doc;
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour will still connected and then expires
    return res
      .cookie("access_token", token, { httpOnly: true, expires: expiryDate })
      .status(200)
      .json({
        message: "user logged in successfully",
        status: true,
        data: {
          token,
        },
      });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc create new user
 * @params POST /api/auth/google
 * @access PUBLIC
 **/
export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: hashedPassword, ...rest } = user._doc;
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8),

        email: req.body.email,
        password: hashedPassword,
        profilePicture: req.body.photo,
      });
      await newUser.save(); //save to the DB
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: hashedPassword2, ...rest } = newUser._doc;
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expiryDate,
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
/**
 * @desc create new user
 * @params POST /api/auth/signout
 * @access PUBLIC
 **/
export const signout = (req, res, next) => {
  try {
    console.log("signout");
    return res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "Signout success!", status: true });
  } catch (error) {
    next(error);
  }
};
