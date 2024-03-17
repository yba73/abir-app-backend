import Joi from "joi";

// validate register data from client
export const valdiateRegister = (user) => {
  const schema = Joi.object({
    firstname: Joi.string().trim().min(2).max(100).required(),
    lastname: Joi.string().trim().min(2).max(100).required(),
    username: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().min(2).max(100).email().required(),
    password: Joi.string().trim().min(6).required(),
    confirm_password: Joi.string().valid(Joi.ref("password")).required(),
  });
  return schema.validate(user);
};

// validate register data from client
export const valdiateLogin = (user) => {
  const schema = Joi.object({
    email: Joi.string().trim().min(2).max(100).email().required(),
    password: Joi.string().trim().min(6).required(),
  });
  return schema.validate(user);
};

// validate login data from client
export const validateUpdateUser = (updateUser) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().min(2).max(100).email().required(),
    password: Joi.string().trim().min(6).required(),
    confirm_password: Joi.string().valid(Joi.ref("password")).required(),
  });
  return schema.validate(updateUser);
};
