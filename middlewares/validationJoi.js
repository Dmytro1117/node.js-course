const validateJoi = (schema) => {
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      error.status = 400;
      throw error;
    }
    next();
  };

  return func;
};

module.exports = validateJoi;
