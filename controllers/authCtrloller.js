const { User } = require("../models/userModel");
const { ctrlWrapperRoutes } = require("../helpers/ctrlWrapperRoutes");
const Conflict = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { nanoid } = require("nanoid");
const { sendEmail } = require("../helpers/sendEmail");

const { SECRET_KEY, BASE_URL } = process.env;

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw new Conflict(409, `Sorry, user with  ${email} in use`);
  }

  const hashBacrypt = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const result = await User.create({
    name,
    email,
    password: hashBacrypt,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    status: "succes",
    code: 201,
    data: {
      user: {
        email,
        name,
      },
    },
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw Conflict(401, "Email not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.json({
    status: "succes",
    code: 200,
    data: {
      message: "Email verify success",
    },
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw Conflict(401, "Email not found");
  }
  if (user.verify) {
    throw Conflict(401, "Email already verify");
  }

  const verifyEmail = {
    to: email,
    subject: "Re-verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click re-verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    status: "succes",
    code: 200,
    data: {
      message: "Re-verify email send success",
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Conflict(401, `Sorry, user with ${email} or password is wrong`);
  }

  if (!user.verify) {
    throw new Conflict(401, "Email not verified");
  }

  const passwordCompare = bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw new Conflict(401, `Sorry, user with ${email} or password is wrong`);
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
  const { name, email } = req.user;
  res.json({
    status: "succes",
    code: 200,
    data: {
      user: {
        name,
        email,
      },
    },
  });
};

const logout = async (req, res) => {
  const { _id, name } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.json({
    status: "succes",
    code: 204,
    data: { message: `Logout ${name} success` },
  });
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;

  const { subscription } = req.body;
  const update = await User.findByIdAndUpdate(
    _id,
    { subscription },
    {
      new: true,
    }
  );
  if (!update) {
    throw new Conflict(`Sorry, not found`);
  }

  res.status(200).json({
    status: "success",
    code: 200,
    data: {
      message: `Subscription change success on ${subscription}`,
    },
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const filePath = req.file.path;

  cloudinary.uploader.upload(
    filePath,
    {
      folder: "avatars",
      transformation: [{ width: 200, height: 200 }],
      allowedFormats: ["jpg", "jpeg", "png", "gif"],
    },
    async (error, result) => {
      if (error) {
        console.error("Помилка завантаження на Cloudinary:", error);
        res.status(500).json({
          status: "error",
          code: 500,
          message: "Помилка завантаження на Cloudinary",
        });
      } else {
        console.log("Завантажено на Cloudinary:", result.url);

        const avatarURL = result.url;
        await User.findByIdAndUpdate(_id, { avatarURL });

        fs.unlinkSync(filePath);

        res.json({
          status: "success",
          code: 200,
          data: { avatarURL },
        });
      }
    }
  );
};

module.exports = {
  register: ctrlWrapperRoutes(register),
  verifyEmail: ctrlWrapperRoutes(verifyEmail),
  resendVerifyEmail: ctrlWrapperRoutes(resendVerifyEmail),
  login: ctrlWrapperRoutes(login),
  curent: ctrlWrapperRoutes(curent),
  logout: ctrlWrapperRoutes(logout),
  updateSubscription: ctrlWrapperRoutes(updateSubscription),
  updateAvatar: ctrlWrapperRoutes(updateAvatar),
};
