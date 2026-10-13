const mongoose = require('mongoose')
const userSchema = new mongoose.Schema (
    {
        name: { type: String, trim: true, maxlength: 100 },
        email: {type: String, required: true, unique: true, lowercase: true, trim: true },
        password: {type: String, required: true, select: false },
        isAdmin: { type: Boolean, default: false, required: true },
        phone: {type: String },
        address: {type: String, trim: true, maxlength: 300},
        avatar: {type: String},
        city: {type: String, trim: true, maxlength: 100},
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },
        passwordChangedAt: { type: Date, select: false }
    },
    {
        timestamps: true
    }

);
const User = mongoose.model("User", userSchema);
module.exports = User;
