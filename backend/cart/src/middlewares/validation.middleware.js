const {body, validationResult,param} = require('express-validator')
const mongoose = require('mongoose')


function  validateResult(req,res,next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    next();
}
const validateAddItemToCart = [
    body('productId')
        .isString()
        .withMessage('Product ID must be a string')
        .custom(value => mongoose.Types.ObjectId.isValid(value)) //check kr rhe hai ki mongoose id ka formate toh valid hai na 
        .withMessage("Invalid Product ID format"),
    
    body('qty')
        .isInt({gt:0}) //greater than  zero nahi hai toh positive integer honi chiye quantity
        .withMessage('Quantity must be a positive integer'),

    validateResult
]
const validateUpdateCartItem = [
    param('productId')
        .isString()
        .withMessage('Product ID must be a string')
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid Product ID format'),
    body('qty')
        .isInt({ gt: 0 })
        .withMessage('Quantity must be a positive integer'),
    validateResult,
];


module.exports = {
    validateAddItemToCart,
    validateUpdateCartItem
}