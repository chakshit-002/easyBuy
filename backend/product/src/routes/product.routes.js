const express= require('express');
const router = express.Router();
const multer = require("multer");
const productController = require('../controllers/product.controller')
const {createProductValidators} = require('../validators/product.validators')
const createAuthMiddleware = require('../middlewares/auth.middleware')


const upload = multer({ storage: multer.memoryStorage() });

// POST /api/products/- 
router.post('/',createAuthMiddleware(['admin','seller']), upload.array('images',5), createProductValidators, productController.createProduct);

// GET /api/products
router.get('/', productController.getProducts);

//yahan se


router.patch('/:id', createAuthMiddleware(["seller"]), productController.updateProduct)


router.delete('/:id',createAuthMiddleware(["seller"]), productController.deleteProduct)

router.get('/seller',createAuthMiddleware(["seller"]),productController.getProductsBySeller);



// GET /api/products/:id
router.get('/:id',productController.getProductById);
//isko move kr diya hai kyu ki conflict hota get req jaa rhi hai... aur yh dynamic thaisliye 

module.exports = router;