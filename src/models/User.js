import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ["admin"],
            default: "admin",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        otp: {
            type: String,
            default: null,
        },

        otpExpiry: {
            type: Date,
            default: null,
        },

        resetToken: {
            type: String,
            default: null,
        },

        resetTokenExpiry: {
            type: Date,
            default: null,
        },

        lastLogin: {
            type: Date,
            default: null,
        },
        otpResendCount: {
            type: Number,
            default: 0,
        },

        otpResendDate: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);