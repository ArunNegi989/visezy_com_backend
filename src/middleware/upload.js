import multer from "multer";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const createFolder = (folder) => {
    const dir = path.join("src", "uploads", folder);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return dir;
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = "others";

        if (file.fieldname === "thumbnail") {
            folder = "blogs";
        }

        if (file.fieldname === "slider" ||
            file.fieldname === "image") {
            folder = "sliders";
        }

        cb(null, createFolder(folder));
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        cb(
            null,
            `${Date.now()}-${nanoid(8)}${extension}`
        );
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only PNG, JPG, JPEG and WEBP images are allowed."
            ),
            false
        );
    }
};

const upload = multer({
    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

export default upload;