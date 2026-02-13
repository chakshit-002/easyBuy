const { body, validationResult } = require('express-validator')


const responseWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next();
}


const createOrderValidations = [
    body('shippingAddress.street')
        .isString()
        .withMessage("Street must be a string")
        .notEmpty()
        .withMessage("Street is required"),

    body('shippingAddress.city')
        .isString()
        .withMessage("city must be a string")
        .notEmpty()
        .withMessage("city is required"),

    body('shippingAddress.state')
        .isString()
        .withMessage("state must be a string")
        .notEmpty()
        .withMessage("state is required"),

    body('shippingAddress.pincode')
        .isString()
        .withMessage("pincode must be a string")
        .notEmpty()
        .withMessage("pincode is required")
        .bail()
        .matches(/^\d{4,}$/)
        .withMessage('Pincode must be at least 4 digits'),
        
    body("shippingAddress.country")
        .isString()
        .withMessage("country must be a string")
        .notEmpty()
        .withMessage("country is required"),

    

    responseWithValidationErrors
]


module.exports = {
    createOrderValidations
}







// body('phone')
//         .optional()
//         .isString()
//         .withMessage('Phone must be a string')
//         .bail()
//         .matches(/^\d{10}$/)
//         .withMessage('Phone must be a valid 10-digit number'),
        
//     body("isDefault")
//         .optional()
//         .isBoolean()
//         .withMessage("isDefault must  be a boolean"),