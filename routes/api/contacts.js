const express = require("express");
const {
  allContacts,
  contactById,
  addOneContact,
  updateContactById,
  updateFavorite,
  deleteContactsById,
} = require("../../controllers/contactsController");
const validateJoi = require("../../middlewares/validationJoi");
const isValidId = require("../../middlewares/isValidId");
const authenticate = require("../../middlewares/authenticate");
const {
  contactJoiSchema,
  favoriteJoiSchema,
} = require("../../models/contactModel");

const router = express.Router();

router.get("/", authenticate, allContacts);

router.get("/:contactId", authenticate, isValidId, contactById);

router.post("/", authenticate, validateJoi(contactJoiSchema), addOneContact);

router.put(
  "/:contactId",
  authenticate,
  isValidId,
  validateJoi(contactJoiSchema),
  updateContactById
);

router.patch(
  "/:contactId/favorite",
  authenticate,
  isValidId,
  validateJoi(favoriteJoiSchema),
  updateFavorite
);

router.delete("/:contactId", authenticate, isValidId, deleteContactsById);

module.exports = router;
