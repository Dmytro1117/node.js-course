const { isValidObjectId } = require("mongoose");
const BadRequest = require("http-errors");

const isValidId = (req, data, next) => {
  const { contactId } = req.params;
  if (!isValidObjectId(contactId)) {
    next(BadRequest(400, `Sorry, ${contactId} is not valid id.`));
  }
  next();
};

module.exports = isValidId;
