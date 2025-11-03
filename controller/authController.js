import userModel from "../models/userModels.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import bcrypt from "bcrypt";

export const signUp = async (req, res) => {
  const { name, email, address, password } = req.body;

  if (!name || !email || !address || !password) {
    req.session.message = "⚠️ Missing Details!";
    return res.redirect("/");
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser && existingUser.isAccountVerified) {
      req.session.message = "⚠️ User already exists. Try with another email.";
      return res.redirect("/");
    }

    if (existingUser && !existingUser.isAccountVerified) {
      await userModel.deleteOne({ email });
    }

    const hasedPassword = await bcrypt.hash(password, 10);

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const newUser = new userModel({
      name,
      email,
      address,
      password: hasedPassword,
      verifyOtp: otp,
      verifyOtpExpiredAt: new Date(Date.now() + 10 * 60 * 1000),
      isAccountVerified: false,
    });

    await newUser.save();

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "connectWrite", email: process.env.SENDER_EMAIL },
        to: [{ email: email }],
        subject: "Account Varification OTP",
        textContent: `Your OTP is ${otp}. Varify your account using this otp.`,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    req.session.message =
      "OTP is send on your registed email. Please! verify your otp.";
    res.redirect("/verifyOtp");
  } catch (err) {
    req.session.message = `❌ Error: ${err.message}`;
    res.redirect("/");
  }
};

export const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  try {
    console.log("opt", otp, typeof otp);

    const user = await userModel.findOne({
      verifyOtp: otp,
      verifyOtpExpiredAt: { $gt: new Date() },
    });

    if (!user) {
      req.session.message = "❌ Invalid or expired OTP. Please try again.";
      return res.redirect("/verifyOtp");
    }

    // console.log("users Details: ", user);

    // OTP is correct - mark user as verified
    user.isAccountVerified = true;
    user.verifyOtp = undefined;
    user.verifyOtpExpiredAt = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 60 * 60 * 1000,
      sameSite: "strict",
      // secure: true (in production)
    });

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "ConnectWrite", email: process.env.SENDER_EMAIL },
        to: [{ email: user.email }],
        subject: "Welcome to ConnectWrite 🎉",
        htmlContent: `
        <h2>Welcome to <b>ConnectWrite</b>!</h2>
        <p>Hi ${user.name},</p>
        <p>Your ConnectWrite account has been created successfully.</p>
        <p>Start writing and share your creativity with the world!</p>
        <a href="https://connectwrite.onrender.com" style="color: #0066ff;">Go to ConnectWrite</a>
        <br><br>
        <p>Best,<br>The ConnectWrite Team</p>
      `,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    req.session.message =
      "✅ OTP verification successful! Welcome to ConnectWrite.";
    res.redirect("/");
  } catch (err) {
    req.session.message = `❌ Error from verifyOtp: ${err.message}`;
    res.redirect("/");
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      req.session.message = "❌ Invalid Email or Password";
      return res.redirect("/signIn");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.session.message = "❌ Invalid Password";
      return res.redirect("/signIn");
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.SECRET_KEY,
      {
        expiresIn: "3h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 60 * 60 * 1000,
      sameSite: "strict", // or 'strict' if you want tighter security
      // secure: true  ✅ only use this in production with HTTPS
    });

    req.session.message = "✅ Login Successful!";
    res.redirect("/");
  } catch (err) {
    req.session.message = `❌ Error: ${err.message}`;
    res.redirect("/");
  }
};

export const showYourArticles = async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: false });

    res.redirect("/");
  } catch (error) {
    req.session.message = `❌ Error: ${err.message}`;
    res.redirect("/");
  }
};
