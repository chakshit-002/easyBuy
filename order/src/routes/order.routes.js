const  express = require('express')
const createAuthMiddleware = require('../middlewares/auth.middleware')
const orderController = require('../controllers/order.controller')
const validationMiddleware = require('../middlewares/validator.middleware')
const router = express.Router();


router.post('/',createAuthMiddleware(["user"]), validationMiddleware.createOrderValidations, orderController.createOrder)


router.get('/me',createAuthMiddleware(["user"]), orderController.getMyOrders)

module.exports = router;