const express= require('express');
const router = express.Router();
const multer = require("multer");
const productController = require('../controllers/product.controller')
const {createProductValidators} = require('../validators/product.validators')
const createAuthMiddleware = require('../middlewares/auth.middleware')


const upload = multer({ storage: multer.memoryStorage() });

// POST /api/products/- 
router.post('/',createAuthMiddleware(['admin','seller']), upload.array('images',5), createProductValidators, productController.createProduct);


module.exports = router;