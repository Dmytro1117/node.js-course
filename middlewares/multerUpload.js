const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

cloudinary.config({
  cloud_name: "dpvqbbgkd",
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const tempDir = path.join(__dirname, "../", "temp");

const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 2048,
  },
});

const multerUpload = multer({
  storage: multerConfig,
});

module.exports = multerUpload;
