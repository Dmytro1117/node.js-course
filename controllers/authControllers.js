const { NotFound, BadRequest } = require("http-errors");
const createErrorUnauthorized = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const User = require("../models/User");
const cloudinaryDownload = require("../helpers/cloudinaryDownload");
const { controllerWrapper } = require("../decorators/controllerWrapper");

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { name, email, password, subscription } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    throw new createErrorUnauthorized(
      409,
      `Sorry, user with email ${email} in use`
    );
  }

  let avatar = null;

  if (req.file) {
    avatar = await cloudinaryDownload(req.file, "avatars", [
      { width: 250, height: 350 },
    ]);
  } else {
    avatar = gravatar.url(email);
  }

  const hashPassword = await bcrypt.hash(password, 10);

  await User.create({ ...req.body, password: hashPassword, avatar });

  res.status(201).json({
    status: "succes",
    code: 201,
    data: {
      user: {
        email,
        name,
        avatar,
      },
    },
  });
};

const login = async (req, res) => {
  const { email, password = "" } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new createErrorUnauthorized(401, `Sorry, email or password is wrong`);
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare || password === "") {
    throw new createErrorUnauthorized(401, `Sorry, email or password is wrong`);
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "5h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    status: "succes",
    code: 200,
    data: {
      token,
    },
  });
};

const curent = async (req, res) => {
  const { name, email, subscription } = req.user;
  res.json({
    status: "succes",
    code: 200,
    data: {
      user: {
        name,
        email,
        subscription,
      },
    },
  });
};

const logout = async (req, res) => {
  const { _id, name } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    status: "succes",
    code: 204,
    data: { message: `Logout ${name} success` },
  });
};

const updateSubscription = async (req, res) => {
  const { _id, name } = req.user;
  const { subscription } = req.body;
  const update = await User.findByIdAndUpdate(_id, { subscription });
  if (!update) {
    throw new NotFound(404, `Sorry, not found`);
  }

  res.status(200).json({
    status: "success",
    code: 200,
    data: {
      message: `Subscription ${name} change on ${subscription} success`,
    },
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;

  if (!req.file) {
    throw new BadRequest(`Please, input file`);
  }

  const avatar = await cloudinaryDownload(req.file, "avatars", [
    { width: 250, height: 350 },
  ]);

  await User.findByIdAndUpdate(_id, { avatar });

  res.json({
    status: "succes",
    code: 200,
    data: { avatar },
  });
};

module.exports = {
  register: controllerWrapper(register),
  login: controllerWrapper(login),
  curent: controllerWrapper(curent),
  logout: controllerWrapper(logout),
  updateSubscription: controllerWrapper(updateSubscription),
  updateAvatar: controllerWrapper(updateAvatar),
};
