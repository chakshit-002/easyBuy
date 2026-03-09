const express = require('express')
const createAuthMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller')
const validation = require('../middlewares/validation.middleware')


const router = express.Router();

//3
router.get('/',createAuthMiddleware(['user']),cartController.getCart);

//1
router.post('/items',validation.validateAddItemToCart, createAuthMiddleware(['user']),cartController.addItemToCart);

//2
router.patch('/items/:productId',validation.validateUpdateCartItem,createAuthMiddleware(['user']),cartController.updateItemQuantity)

module.exports = router;



// ham chahte toh middleware product vala use krskte thae
// pr ham nahi kiye same copy paste kr liye ya khud ka bana lenge 
// kyu ki microservice architecture mei sab services independent  hoti hai ek dusre se
// that's why require ya include nahi kiya product service se
// aur phir ham inn services ka code alag alag languages mei likh ke integrate bhi kr skte hai...
// isliye hamne require nahi kiya kya pta python ya java mei likha ho aur yahn js use krii toh chlega kese code ilsiey
// aur sabhi services ke database alag  bhi hoskte hai.... and independent hote hai 
// aur har service ko ek alag team manage kr rhi hoti  hai .....
