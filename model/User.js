const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
    unique: true,
  },
  mobile: {
    type: String,
    // required: true,
    unique: true,
  },
  password: {
    type: String,
    // required: true,
  },
  verified: {
    type: Boolean,
    default: false,
    // required: true,
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, 8);
    this.password = hash;
  }
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compareSync(password, this.password);
  return result;
};

module.exports = mongoose.model("User", UserSchema);
