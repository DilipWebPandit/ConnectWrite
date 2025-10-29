import express from "express";
import { signUp, signIn, verifyOtp } from "../controller/authController.js";
const routers = express.Router();

routers.post("/signUp", signUp);
routers.post("/signIn", signIn);

routers.post("/verifyOtp", verifyOtp);

routers.get("/signUp", (req, res) => {
  const message = req.session.message;
  req.session.message = null;
  res.render("signUp.ejs", { message });
});

routers.get("/verifyOtp", (req, res) => {
  const message = req.session.message;
  req.session.message = null;
  res.render("otpVarification.ejs", { message });
});

routers.get("/signIn", (req, res) => {
  const message = req.session.message;
  req.session.message = null;
  res.render("signIn.ejs", { message });
});

routers.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
  req.session.message = "✅ Logged out successfully!";
  res.redirect("/");
});

export default routers;
