import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.handler.js";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";
import {
  valdiateEmail,
  valdiateLogin,
  valdiateRegister,
  valdiateResetPassword,
} from "../validations/users.schemas.js";
import { restePassword } from "../utils/html.template.js";
import sendMail from "../services/send.email.js";
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
    const token = generateToken(validUser._id, "1h");
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
 * @desc forgot password
 * @params PUT /api/v1/auth/forgot-password/
 * @access PRIVTE (owenr of this account)
 **/

export const sendforgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const { error } = valdiateEmail(req.body);
    console.log("email", email);
    if (error)
      return res
        .status(400)
        .json({ status: "fail", message: error.details[0].message });

    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res
        .status(404)
        .json({ status: "fail", message: "user not found, invalid email" });
    }
    const token = generateToken(existUser._id, "1h");

    const subject = "Forgot password";

    const link = `${process.env.BASE_URL_CLIENT}/auth/password-reset/${existUser._id}/${token}/`;

    const html = restePassword(existUser._id, token);
    const expiryDate = new Date(Date.now() + 3600000);
    await sendMail(email, subject, html);
    return res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        expires: expiryDate,
      })
      .json({
        status: "sucess",
        message: "password reset link sent to your email account",
      });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
    throw new Error(`error verfied account ${error}`);
  }
};

/**
 * @desc create new password
 * @params POST /api/v1/auth/password-reset/:id/
 * @access PRIVTE (owenr of this account)
 **/

export const createNewPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    console.log("req.body", req.body);
    const existUser = await User.findById(id);
    if (!existUser)
      return res
        .status(404)
        .json({ status: "fail", message: "invalid id, user not found" });

    const { error } = valdiateResetPassword(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: "fail", message: error.details[0].message });

    const checkOwener = id === req.user.id.toString();
    if (!checkOwener)
      return res
        .status(401)
        .json({ status: "fail", message: "you are not owner of this account" });
    // crypt password
    const salt = bcryptjs.genSaltSync(10); // alg of crypt
    const hash = bcryptjs.hashSync(password, salt);

    await User.findByIdAndUpdate(id, { password: hash });

    return res
      .status(200)
      .json({ status: "success", message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
    throw new Error(`createNewPassword error ${error}`);
  }
};

/**
 * @desc signout
 * @params POST /api/auth/signout
 * @access PRIVITE (user login)
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
