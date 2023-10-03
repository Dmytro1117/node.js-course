const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../helpers/handleMongooseError");

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const typeSubscription = ["starter", "pro", "business"];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    password: {
      type: String,
      required: [true, "Set password for user"],
      minlength: 10,
    },
    email: {
      type: String,
      match: emailRegexp,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: typeSubscription,
      default: "starter",
    },
    token: {
      type: String,
      default: "",
    },
    avatarURL: {
      type: String,
      required: true,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const registerJoiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().pattern(emailRegexp).required(),
  // email: Joi.string().required(),
  password: Joi.string().min(10).required(),
});

const verrifyEmailJoiSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  // email: Joi.string().required(),
});

const loginJoiSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  // email: Joi.string().required(),
  password: Joi.string().min(10).required(),
});

const subscriptionJoiSchema = Joi.object({
  subscription: Joi.string()
    .valid(...typeSubscription)
    .required(),
});

const User = model("user", userSchema);

module.exports = {
  User,
  registerJoiSchema,
  verrifyEmailJoiSchema,
  loginJoiSchema,
  subscriptionJoiSchema,
};
