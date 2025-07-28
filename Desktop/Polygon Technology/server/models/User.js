const mongoose = require("mongoose");

// ✅ Single Schema Declaration
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Password Hashing Before Save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  next();
});

module.exports = mongoose.model("User", userSchema);
