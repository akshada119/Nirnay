const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.resolve(
    __dirname,
    "../public/uploads/services"
);

// Check whether the path already exists
if (fs.existsSync(uploadPath)) {

    const stats = fs.statSync(uploadPath);

    // If something exists there but it is NOT a folder
    if (!stats.isDirectory()) {
        throw new Error(
            `Upload path exists but is not a directory: ${uploadPath}`
        );
    }

} else {

    // Create the folder
    fs.mkdirSync(uploadPath, {
        recursive: true
    });
}

console.log("SERVICE UPLOAD DIRECTORY:", uploadPath);

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {

        const extension = path.extname(file.originalname);

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            extension;

        cb(null, uniqueName);
    }
});

const fileFilter = function (req, file, cb) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, PNG and WEBP images are allowed."
            )
        );
    }
};

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});

module.exports = upload;