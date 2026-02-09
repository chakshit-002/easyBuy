const { body, validationResult } = require('express-validator')


const responseWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next();
}
//hum sare validation rules banayenge registerUserValidations ke andar aur phir koi validations fail hote hai toh with message hai  
// lkin  vo forward nahi honge uske liye upper ek middleware banaya hai respondWithValidationErrors jo check karega ki koi validation errors toh nahi hai , 
// agar hai toh 400 bad request ke sath error messages bhej dega , agar sab kuch theek hai toh next() karke agle middleware ya controller function ko call kar dega
const registerUserValidations = [
    body('username')
        .isString()
        .withMessage('Username must be a string')
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long"),

    body('email')
        .isEmail()
        .withMessage("Invalid email address"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be atleast of 6 characters long"),

    body("fullName.firstName")
        .isString()
        .withMessage("First name must be a string")
        .notEmpty()
        .withMessage("First name is required"),

    body("fullName.lastName")
        .isString()
        .withMessage("Last name must be a string")
        .notEmpty()
        .withMessage("Last name is required"),

    body("role")
        .optional()
        .isIn(['user', 'seller'])
        .withMessage("Role must be either 'user' or 'seller' "),
    responseWithValidationErrors

]


const loginUserValidations = [
    body('email')
        .optional()
        .isEmail()
        .withMessage("Invalid email address"),

    body("username")
        .optional()
        .isString()
        .withMessage("username must be  a string"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be atleast of 6 characters long"),

    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({
                errors: [{
                    msg: "Either email or Username is required",
                }]
            })
        }
        responseWithValidationErrors(req, res, next);
    }
]

const addUserAddressValidations = [
    body('street')
        .isString()
        .withMessage("Street must be a string")
        .notEmpty()
        .withMessage("Street is required"),

    body('city')
        .isString()
        .withMessage("city must be a string")
        .notEmpty()
        .withMessage("city is required"),

    body('state')
        .isString()
        .withMessage("state must be a string")
        .notEmpty()
        .withMessage("state is required"),

    body('pincode')
        .isString()
        .withMessage("pincode must be a string")
        .notEmpty()
        .withMessage("pincode is required")
        .bail()
        .matches(/^\d{4,}$/)
        .withMessage('Pincode must be at least 4 digits'),
        
    body("country")
        .isString()
        .withMessage("country must be a string")
        .notEmpty()
        .withMessage("country is required"),

    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage("isDefault must  be a boolean"),

    responseWithValidationErrors
]
module.exports = {
    registerUserValidations,
    loginUserValidations,
    addUserAddressValidations
}