const mongoose = require("mongoose");

const bcrypt = require('bcryptjs');

const verificationTokenSchema = new mongoose.Schema({
 

  email: {
    type: String,
    required: true,
  },
  
  otp:{
    type:String,
    require:true,
  },

  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

verificationTokenSchema.pre('save', async function (next) {
  if (this.isModified('token')) {
    const hash = await bcrypt.hash(this.token, 8);
    this.token = hash;
  }
  next();
});

verificationTokenSchema.methods.compareToken = async function (token) {
  const result = await bcrypt.compare(token, this.token);
  return result;
};

module.exports = mongoose.model("VerificationToken", verificationTokenSchema);
