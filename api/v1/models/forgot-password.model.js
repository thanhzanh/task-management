const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema(
    {
        email: String,
        opt: String,
        expireAt: {
            type: Date,
            expires: 180
        }
    }, 
    {
        timestamps: true
    }
);

const ForgotPassword = mongoose.model("ForgotPassword", forgotPasswordSchema, "forgot-password");

module.exports = ForgotPassword;