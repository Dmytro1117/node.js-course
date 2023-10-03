const { Contact } = require("../models/contactModel");
const { NotFound } = require("http-errors");
const { ctrlWrapperRoutes } = require("../helpers/ctrlWrapperRoutes");

const allContacts = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const contacts = await Contact.find({ owner }, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "_id name email");
  res.json({
    status: "succes",
    code: 200,
    data: {
      result: contacts,
    },
  });
};

const contactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new NotFound(`Sorry, contact with contactId ${contactId} not found`);
  }
  res.json({
    status: "succes",
    code: 200,
    data: {
      contact,
    },
  });
};

const addOneContact = async (req, res) => {
  const { _id: owner } = req.user;
  const addedContact = await Contact.create({ ...req.body, owner });

  res.status(201).json({
    status: "succes",
    code: 201,
    data: { addedContact },
  });
};

const updateContactById = async (req, res) => {
  const { contactId } = req.params;
  const update = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  if (!update) {
    throw new NotFound(`Sorry, contact with contactId ${contactId} not found`);
  }
  res.json({
    status: "succes",
    code: 200,
    data: { update },
  });
};

const updateFavorite = async (req, res) => {
  const { contactId } = req.params;
  const { favorite } = req.body;
  const update = await Contact.findByIdAndUpdate(
    contactId,
    { favorite },
    {
      new: true,
    }
  );
  if (!update) {
    throw new NotFound(`Sorry, contact with contactId ${contactId} not found`);
  }
  res.json({
    status: "succes",
    code: 200,
    data: { update },
  });
};

const deleteContactsById = async (req, res, next) => {
  const { contactId } = req.params;
  const delet = await Contact.findByIdAndRemove(contactId);
  if (!delet) {
    throw new NotFound(`Sorry, contact with contactId ${contactId} not found`);
  }
  res.json({
    status: "succes",
    code: 200,
    message: "contact deleted",
    data: { delet },
  });
};

module.exports = {
  allContacts: ctrlWrapperRoutes(allContacts),
  contactById: ctrlWrapperRoutes(contactById),
  addOneContact: ctrlWrapperRoutes(addOneContact),
  updateContactById: ctrlWrapperRoutes(updateContactById),
  updateFavorite: ctrlWrapperRoutes(updateFavorite),
  deleteContactsById: ctrlWrapperRoutes(deleteContactsById),
};
