const router = require('express').Router()
const { createUser,VerifyMobileOTP,signUpWithMobile, SendOTPToMobile,signin, verifyEmail, sendOtp, signInWithMobile } = require('../controller/userController')
const { validateUser, validate } = require('../middleware/validators')


router.post('/register-email',createUser)
router.post('/send-otp', sendOtp);
router.post('/verify-email', verifyEmail)
router.post('/signin-email', signin)

// Registration through Mobile
router.post('/sendmobile-otp', SendOTPToMobile)
router.post('/verify-otp', VerifyMobileOTP)
router.post('/register-mobile', signUpWithMobile)
router.post('/signIn-mobile', signInWithMobile)




module.exports = router