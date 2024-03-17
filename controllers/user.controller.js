import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.handler.js";
import bcryptjs from "bcryptjs";
import {
  valdiateRegister,
  validateUpdateUser,
} from "../validations/users.schemas.js";

export const test = (req, res) => {
  res.json({
    message: "API is working!",
  });
};

/**
 * @desc get all user
 * @params GET /api/user
 * @access PUBLIC
 **/
export const getUsers = async (req, res, next) => {
  try {
    // get all users from db and except password
    const users = await User.find().select("-password");
    return res.status(200).json({
      message: "get all users success",
      status: true,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc get user by id
 * @params GET /api/user/:id
 * @access PUBLIC
 **/
export const getUser = async (req, res, next) => {
  try {
    // get user from db and except password
    const user = await User.findById(req.params.id).select("-password");
    //ckeck if user exist or not
    if (!user) return next(errorHandler(404, "user not found, invalid id"));
    return res.status(200).json({
      message: "get user success",
      status: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc update user
 * @params PUT /api/user/:id
 * @access PRIVET (owner of this account)
 **/
export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, "You can update only your account!")); //if another user try to update another account
    }
    // validate update user schema
    const { error } = validateUpdateUser(req.body);
    if (error) return next(errorHandler(400, `${error.details[0].message}`));
    const { username, email, password } = req.body;
    // check user already exists
    const existUser = await User.find({ $or: [{ email }, { username }] });
    if (existUser.length) return next(errorHandler(409, "user already exists"));
    const hashPassword = bcryptjs.hashSync(password, 10); //crypting the new password

    await User.findByIdAndUpdate(req.params.id, {
      username,
      email,
      password: hashPassword,
    });

    return res
      .status(200)
      .json({ message: "user updated success", status: true });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc delete user
 * @params DELETE /api/user/:id
 * @access PRIVET (owner of this account)
 **/

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can delete only your account!"));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ message: "User has been deleted...", status: true });
  } catch (error) {
    next(error);
  }
};

// update user

// export const updateUser = async (req, res, next) => {
//   if (req.user.id !== req.params.id) {
//     return next(errorHandler(401, "You can update only your account!")); //if another user try to update another account
//   }
//   try {
//     if (req.body.password) {
//       req.body.password = bcryptjs.hashSync(req.body.password, 10); //crypting the new password
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           username: req.body.username,
//           email: req.body.email,
//           password: req.body.password,
//           profilePicture: req.body.profilePicture,
//         },
//       },
//       { new: true } // to submit changes and see new user data in his profile
//     );
//     const { password, ...rest } = updatedUser._doc;
//     res.status(200).json(rest);
//   } catch (error) {
//     next(error);
//   }
// };

// delete user
