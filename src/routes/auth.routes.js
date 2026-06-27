import express from "express";

import {
    adminExists,
    signup,
    verifyOTP,
    login,
    logout,
    me,
    forgotPassword,
    resetPassword,
    changePassword,
    resendOTP,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/admin-exists", adminExists);

router.post("/signup", signup);

router.post("/verify-otp", verifyOTP);

router.post("/login", login);

router.post("/logout", logout);

router.get("/me", protect, me);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.put("/change-password", protect, changePassword);

router.post("/resend-otp", resendOTP);

export default router;