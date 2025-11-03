import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: false },
  address: { type: String, required: true },
  password: { type: String, required: true },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpiredAt: { type: Date, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  created_at: {
    type: Date,
    default: () => {
      // Get current time in IST
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes
      return new Date(Date.now() + istOffset);
    },
  },
  updated_at: {
    type: Date,
    default: () => {
      const istOffset = 5.5 * 60 * 60 * 1000;
      return new Date(Date.now() + istOffset);
    },
  },
});

// TTL index: delete user automatically after OTP expires, but only if not verified
userSchema.index(
  { verifyOtpExpiredAt: 1 },
  {
    expireAfterSeconds: 120, // this will give 2 min more after otp expires
    partialFilterExpression: { isAccountVerified: false },
  }
);

const userModel = mongoose.model("user", userSchema);
export default userModel;
