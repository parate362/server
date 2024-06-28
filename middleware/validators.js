const { check, validationResult } = require('express-validator')

exports.validateUser= [
    check('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage("Name is missing!"),
    check('email')
    .normalizeEmail()
    .isEmail()
    .withMessage('Email is invalid!'),
    // check('mobile')
    // .trim()
    // .not()
    // .isEmpty()
    // .withMessage("Number is missing!"),
    check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage("Name is missing!")
    .isLength({min:8, max:16})
    .withMessage('Password must be 8 to 16 character long!')

]

exports.validate= (req, res, next) =>{
   const error = validationResult(req).array()
   if(!error.length) return next()

    res.status(400).json({success:false, error:error[0].msg})

}