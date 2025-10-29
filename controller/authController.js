import userModel from "../models/userModels.js";
import jwt from "jsonwebtoken";
import transpoter from "../config/nodemailer.js";

export const signUp = async (req, res) => {
  const { name, email, address, password } = req.body;

  if (!name || !email || !address || !password) {
    req.session.message = "⚠️ Missing Details!";
    return res.redirect("/");
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      req.session.message = "⚠️ User already exists. Try with another email.";
      return res.redirect("/");
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const newUser = new userModel({
      name,
      email,
      address,
      password,
      verifyOtp: otp,
      verifyOtpExpiredAt: new Date(Date.now() + 10 * 60 * 1000),
      isAccountVerified: false,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, name: newUser.name },
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

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Account Varification OTP",
      text: `Your OTP is ${otp}. Varify your account using this otp.`,
    };

    await transpoter.sendMail(mailOptions);

    // req.session.message = "✅ User Registered Successfully!";

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

    console.log("users Details: ", user);

    if (!user) {
      req.session.message = "❌ Invalid or expired OTP. Please try again.";
      return res.redirect("/verifyOtp");
    }

    // OTP is correct - mark user as verified
    user.isAccountVerified = true;
    user.verifyOtp = undefined;
    user.verifyOtpExpiredAt = undefined;
    await user.save();

    // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Welcome to ConnectWrite 🎉",
      html: `
        <h2>Welcome to <b>ConnectWrite</b>!</h2>
        <p>Hi ${user.name},</p>
        <p>Your ConnectWrite account has been created successfully.</p>
        <p>Start writing and share your creativity with the world!</p>
        <a href="https://www.connectwrite.com" style="color: #0066ff;">Go to ConnectWrite</a>
        <br><br>
        <p>Best,<br>The ConnectWrite Team</p>
      `,
    };

    await transpoter.sendMail(mailOptions);

    req.session.message =
      "✅ OTP verification successful! Welcome to ConnectWrite.";
    res.redirect("/");

    // if (matchOtp) {
    //   req.session.message = "OTP varification successful.";

    //   await transpoter.sendMail(mailOptions);

    //   return res.redirect("/");
    // } else {
    //   req.session.message = "Please try again. Wrong otp.";
    // }
  } catch (err) {
    req.session.message = `❌ Error from verifyOtp: ${err.message}`;
    res.redirect("/");
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email, password });
    if (!user) {
      req.session.message = "❌ Invalid Email or Password";
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
