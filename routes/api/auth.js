const express = require("express");
const validateJoi = require("../../middlewares/validationJoi");
const {
  register,
  login,
  curent,
  logout,
  updateSubscription,
  updateAvatar,
} = require("../../controllers/authCtrloller");
const authenticate = require("../../middlewares/authenticate");

const {
  registerJoiSchema,
  loginJoiSchema,
  subscriptionJoiSchema,
} = require("../../models/userModel");
const multerUpload = require("../../middlewares/multerUpload");

const router = express.Router();

router.post("/register", validateJoi(registerJoiSchema), register);
router.post("/login", validateJoi(loginJoiSchema), login);
router.get("/current", authenticate, curent);
router.post("/logout", authenticate, logout);
router.patch(
  "/subscription",
  authenticate,
  validateJoi(subscriptionJoiSchema),
  updateSubscription
);
router.patch(
  "/avatars",
  authenticate,
  multerUpload.single("avatar"),
  updateAvatar
);

module.exports = router;
