import express from "express";

import {
    createContact,
    getContacts,
    getContact,
    deleteContact,
    markAsRead,
    sendReply,
} from "../controllers/contact.controller.js";

const router = express.Router();

// Public
router.post("/", createContact);

// Admin
router.get("/", getContacts);

router.get("/:id", getContact);

router.patch("/:id/read", markAsRead);

router.delete("/:id", deleteContact);

router.post("/send-email", sendReply);

export default router;