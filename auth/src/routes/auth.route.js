const express = require('express')
const validators = require('../middlewares/validator.middleware')
const router = express.Router();
const authController = require('../controllers/auth.controller')
const authMiddleware = require("../middlewares/auth.middleware")

router.post('/register',validators.registerUserValidations,authController.registerUser);
// request jab  iss API pr aaegi aur req.body mei kuch bhi galat hoga toh  usme validations pass ho jayege tabhi authController.registerUser call hoga nahi toh pass nahi hoga aur error response chala jayega

router.post("/login",validators.loginUserValidations,authController.loginUser);

router.get('/me',authMiddleware.authMiddleware, authController.getCurrentUser);

router.get("/logout",authController.logoutUser);


router.get('/users/me/addresses',authMiddleware.authMiddleware, authController.getUserAddresses)


router.post("/users/me/addresses", validators.addUserAddressValidations, authMiddleware.authMiddleware, authController.addUserAddress);


router.delete("/users/me/addresses/:addressId",authMiddleware.authMiddleware, authController.deleteUserAddress);


module.exports = router;