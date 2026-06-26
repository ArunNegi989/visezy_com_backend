import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import transporter from "../config/mail.js";
import { generateToken } from "../utils/jwt.js";

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Visezy" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "Verify your Visezy Admin Account",
        html: `
            <div style="font-family:Arial,sans-serif;padding:30px">
                <h2>Verify Your Email</h2>

                <p>Your OTP is</p>

                <h1
                    style="
                        letter-spacing:8px;
                        color:#2563eb;
                    "
                >
                    ${otp}
                </h1>

                <p>
                    OTP expires in
                    <strong>10 minutes</strong>.
                </p>

                <br>

                <small>
                    If you didn't request this,
                    ignore this email.
                </small>
            </div>
        `,
    });
};

const sendResetEmail = async (email, link) => {
    await transporter.sendMail({
        from: `"Visezy" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "Reset Password",
        html: `
<div
style="
max-width:600px;
margin:auto;
padding:40px;
font-family:Arial,sans-serif;
background:#ffffff;
border-radius:12px;
border:1px solid #e5e7eb;
">

<h2
style="
margin:0;
color:#2563eb;
"
>
Visezy Admin
</h2>

<p
style="
margin-top:30px;
font-size:16px;
color:#374151;
"
>
Hello,
</p>

<p
style="
line-height:28px;
color:#4b5563;
"
>
We received a request to reset your
admin account password.
</p>

<div
style="
text-align:center;
margin:40px 0;
"
>

<a
href="${link}"
style="
background:#2563eb;
color:white;
padding:14px 30px;
text-decoration:none;
border-radius:8px;
display:inline-block;
font-weight:bold;
"
>
Reset Password
</a>

</div>

<p
style="
color:#6b7280;
line-height:28px;
"
>
This link will expire in
<strong>15 minutes</strong>.
</p>

<p
style="
margin-top:30px;
color:#6b7280;
"
>
If you didn't request this,
please ignore this email.
</p>

<hr
style="
margin:30px 0;
border:none;
border-top:1px solid #e5e7eb;
"
/>

<p
style="
font-size:12px;
color:#9ca3af;
"
>
© Visezy Admin Panel
</p>

</div>
`
    });
};

export const adminExists = async (req, res) => {

    const admin = await User.findOne({
        isVerified: true,
    });

    return res.status(200).json({
        success: true,
        exists: !!admin,
    });

};
export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Only one admin allowed
        const adminExists = await User.findOne({
            isVerified: true,
        });

        if (adminExists) {
            return res.status(403).json({
                success: false,
                message:
                    "Admin already exists. Signup is disabled.",
            });
        }

        // Existing email
        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already registered.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const otp = generateOTP();

        const otpExpiry = new Date(
            Date.now() + 10 * 60 * 1000
        );

        if (existingUser) {
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.otp = otp;
            existingUser.otpExpiry = otpExpiry;
            existingUser.isVerified = false;

            await existingUser.save();
        } else {
            await User.create({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiry,
                isVerified: false,
            });
        }

        await sendOTPEmail(email, otp);

        return res.status(200).json({
            success: true,
            message:
                "OTP sent successfully. Please verify your email.",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });

    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required.",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Account already verified.",
            });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired.",
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        user.lastLogin = new Date();
        user.otpResendCount = 0;
        user.otpResendDate = null;
        await user.save();


        return res.status(200).json({
            success: true,
            message: "Email verified successfully. Please login.",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }
        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: "Please verify your email first.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account disabled.",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        user.lastLogin = new Date();

        await user.save();

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });

    }
};

export const logout = async (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });

};

export const me = async (req, res) => {

    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            lastLogin: req.user.lastLogin,
        },
    });

};

export const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email.",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink =
            `${process.env.CLIENT_URL}/admin/reset-password/${resetToken}`;

        await sendResetEmail(email, resetLink);

        return res.status(200).json({
            success: true,
            message: "Password reset link sent successfully.",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });

    }
};

export const resetPassword = async (req, res) => {
    try {

        const { token } = req.params;

        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required."
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters.",
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: {
                $gt: Date.now(),
            },
        }).select("+password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or expired.",
            });
        }
        const isSamePassword = await bcrypt.compare(
            password,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as your current password.",
            });
        }
        user.password = await bcrypt.hash(password, 12);

        user.resetToken = null;
        user.resetTokenExpiry = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful.",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });

    }
};

export const changePassword = async (req, res) => {

    try {

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both passwords are required.",
            });
        }
        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as the old password.",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters.",
            });
        }
        const user = await User.findById(req.user._id)
            .select("+password");

        const isMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect.",
            });
        }

        user.password = await bcrypt.hash(
            newPassword,
            12
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });

    }

};


export const resendOTP = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Account already verified.",
            });
        }

        const today = new Date();

        if (
            !user.otpResendDate ||
            user.otpResendDate.toDateString() !==
            today.toDateString()
        ) {
            user.otpResendCount = 0;
            user.otpResendDate = today;
        }

        if (user.otpResendCount >= 3) {
            return res.status(429).json({
                success: false,
                message:
                    "You have reached today's OTP resend limit.",
            });
        }

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpiry = new Date(
            Date.now() + 10 * 60 * 1000
        );

        user.otpResendCount += 1;

        await user.save();

        await sendOTPEmail(user.email, otp);

        return res.status(200).json({
            success: true,
            message: `OTP sent successfully. Remaining attempts: ${3 - user.otpResendCount
                }`,
            remainingAttempts:
                3 - user.otpResendCount,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });

    }
};