import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import crypto from "crypto";
import { Resend } from "resend";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);


// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(500).json({
      message: "Unable to register user",
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to log in",
    });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve profile",
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  let user = null;
  let resetToken = null;

  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "A valid email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    await user.save();

    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl || !process.env.RESEND_API_KEY) {
      throw new Error("CLIENT_URL or RESEND_API_KEY is missing");
    }

    const resetUrl =
      `${clientUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: "News Sentiment Checker <noreply@omprakashrajbanshi.com.np>",
      to: [normalizedEmail],
      subject: "Password Reset Request - Test",
      text: `Test email. Password reset link: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Password Reset Email Test</h2>
          <p>This is a test of your Resend integration.</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
        </div>
      `,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log("Resend test email accepted:", data?.id);

    return res.status(200).json({
      message: "Resend test email accepted successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    if (user && resetToken) {
      try {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
      } catch (cleanupError) {
        console.error("Failed to clear reset token:", cleanupError.message);
      }
    }

    return res.status(500).json({
      message: "Unable to send the password reset email. Please try again later.",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Invalidate the token after successful password reset
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      message: "Unable to reset password",
    });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  resetPassword,
};
