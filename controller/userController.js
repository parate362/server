const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const VerificationToken = require("../model/verificationToken");
const { sendError } = require("../utils/helper");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
  generateOTP,
  mailTransport,
  generateEmailTemplate,
} = require("../utils/mail");
// const client = require('twilio')(process.env.accountSid, process.env.authToken);
const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Check if environment variables are loaded correctly
if (!accountSid || !authToken) {
  throw new Error(
    "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in the environment variables."
  );
}


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


exports.SendOTPToMobile = async (req, res) => {
  const otp = generateOTP();
  const hash = await bcrypt.hash(otp, 8);

  try {
    console.log(req.body, "--- body ----");
    const phone = Number(req.body.mobileNumber);
    const sendOtp = await client.messages.create({
      body: `Your OTP for Keek is ${otp}`,
      to: `+91${phone}`, // Text this number
      from: process.env.TWILIO_PHONE_NUMBER, // From a valid Twilio number
    });

    if (sendOtp) {
      return res.send({
        status: true,
        statuscode: 201,
        message: "OTP sent successfully",
      });
    } else {
      return res.send({
        status: false,
        statuscode: 422,
        message: "Something went wrong!",
      });
    }
  } catch (error) {
    console.log(error, "---- error 194 ---");
    return res.send({
      status: false,
      statuscode: 500,
      message: "Something went wrong!",
    });
  }
};

exports.VerifyMobileOTP = async (req, res) => {
  const { mobile, otp } = req.body;
  const user = await User.findOne({ mobile });

  if (!user) {
    return res.status(400).send("Invalid OTP");
  }

  user.verified = true;
  await user.save();

  res.status(200).send("User verified");
};

exports.signUpWithMobile = async (req, res) => {
  const { name, mobile } = req.body;

  // Check if the user already exists
  let user = await User.findOne({ mobile });
  if (!user) {
    return res.status(400).send("User not found. Please request OTP first.");
  }

  if (!user.verified) {
    return res
      .status(400)
      .send("User not verified. Please verify your OTP first.");
  }

  // Update user with password
  user.password = password; // Password will be hashed in the pre-save hook
  user.name = name;
  await user.save();

  res.status(200).send("Signup successful. You can now log in.");
};

exports.signInWithMobile = async (req, res) => {
  const { mobileNumber, password } = req.body;
  const user = await User.findOne({ mobileNumber, isVerified: true });

  if (!user) {
    return res.status(400).send("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send("Invalid credentials");
  }

  res.status(200).send("Login successful");
};


exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  const hash = await bcrypt.hash(otp, 8);

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`,
  };

  mailTransport().sendMail(mailOptions, async (error, info) => {
    if (error) {
      return res.status(500).json({ error: "Failed to send OTP" });
    } else {
      const verificationToken = new VerificationToken({
        email: email,
        token: otp,
      });
      await verificationToken.save();
      res.status(200).send({ message: "OTP sent" });
    }
  });
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body, "---- log 205 ----");

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(402).json({
        status: false,
        statuscode: 402,
        message: "User email already exists!",
      });
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      // password: hashedPassword,
    });

    // Save user to database
    await newUser.save();

    // Return success response
    return res.status(201).json({
      status: true,
      statuscode: 201,
      message: "User registered successfully.",
      data: newUser,
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    return res.status(500).json({
      status: false,
      statuscode: 500,
      message: "Something went wrong!",
    });
  }
};


// exports.signInWithEmail = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email.trim() || !password.trim())
//     return sendError(res, "email/password is missing!");

//   const user = await User.findOne({ email });
//   if (!user) return sendError(res, "User not found!");

//   const isMatched = await user.comparePassword(password);
//   if (!isMatched) return sendError(res, "email/password does not matched");

//   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//     expiresIn: "1d",
//   });

//   res.json({
//     success: true,
//     user: { name: user.name, email: user.email, id: user._id, token },
//   });
// };

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email.trim() || !password.trim())
    return sendError(res, "email/password is missing!");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found!");

  const isMatched = await user.comparePassword(password);
  if (!isMatched) return sendError(res, "email/password does not matched");

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({
    success: true,
    user: { name: user.name, email: user.email, id: user._id, token },
  });
};

// exports.signin = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return sendError(res, "Email and password are required!", 400);
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return sendError(res, "User not found!", 404);
//     }

//     const isMatched = await user.comparePassword(password);
//     if (!isMatched) {
//       return sendError(res, "Email or password is incorrect!", 401);
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.json({
//       success: true,
//       user: { name: user.name, email: user.email, id: user._id, token },
//     });
//   } catch (err) {
//     console.error(err);
//     sendError(res, "Internal Server Error", 500);
//   }
// };

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const verificationToken = await VerificationToken.findOne({
      email: email,
    });
    if (!verificationToken) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const isValid = await bcrypt.compare(otp, verificationToken.token);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    email.varified = true;
    await VerificationToken.deleteOne({ email: email });
    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
  mailTransport().sendMail({
    from: "emailverification@gmail.com",
    to: email,
    subject: "Wekcome To Keek",
    html: "<h1>Email Verified Successfully</h1>",
  });
};

// exports.verifyEmail = async (req, res) => {
//   const { email, otp } = req.body;
//   if (!email || !otp.trim())
//     return sendError(res, "Invaid request, missing parameters!");

//   if (!isValidEmail(email)) return sendError(res, "Invaid user id!");

//   const user = await User.findOne(email);
//   if (!user) return sendError(res, "Sorry, user not found!");

//   if (user.varified)
//     return sendError(res, "This account is alreaddy verified!");

//   const token = await VerificationToken.findOne({ owner: user.email });
//   if (!token) return sendError(res, "Sorry, user not found!");

//   const isMatched = await token.compareToken(otp);
//   if (!isMatched) return sendError(res, "Please provide valid token!");

//   user.varified = true;

//   await VerificationToken.findByIdAndDelete(token._id);
//   await user.save();app.post('/api/user/verify-otp', async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const verificationToken = await VerificationToken.findOne({ owner: email });
//     if (!verificationToken) {
//       return res.status(400).json({ error: 'Invalid OTP' });
//     }

//     const isValid = await bcrypt.compare(otp, verificationToken.token);
//     if (!isValid) {
//       return res.status(400).json({ error: 'Invalid OTP' });
//     }

//     await VerificationToken.deleteOne({ owner: email });
//     res.json({ message: 'OTP verified successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

//   mailTransport().sendMail({
//     from: "emailverification@gmail.com",
//     to: user.email,
//     subject: "Wekcome To Keek",
//     html: "<h1>Email Verified Successfully</h1>",
//   });

//   res.json({
//     success: true,
//     messege: "your email is verified",
//     user: { name: user.name, email: user.email, id: user._id, token },
//   });
// };
