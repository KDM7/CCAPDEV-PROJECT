const express = require('express');
const router = express();
const controller = require('../controller/index');
const indexMiddleware = require('../middlewares/indexMiddleware');

// GETS
router.get('/', controller.getLogin);

//Customers
//Gets
//Menu
router.get('/u', controller.getRestaurants);
router.get('/u/ChzIT', controller.getChzMenu);
router.get('/u/SpCity', controller.getSpcMenu);
router.get('/u/TacTown', controller.getTacMenu);
router.get('/u/PotAc', controller.getPotMenu);
router.get('/u/BenG', controller.getBenMenu);
router.get('/u/AlCent', controller.getAlmuMenu);

//Ordering
router.get('/u/ChzIT/:mealID', controller.getOneChzMeal);
router.get('/u/SpCity/:mealID', controller.getOneSpcMeal);
router.get('/u/TacTown/:mealID', controller.getOneTacMeal);
router.get('/u/PotAc/:mealID', controller.getOnePotMeal);
router.get('/u/BenG/:mealID', controller.getOneBenMeal);
router.get('/u/AlCent/:mealID', controller.getOneAlmuMeal);

//Confirming Order
router.get('/u/cart/ChzIT', controller.getChzCart);
router.get('/u/cart/SpCity', controller.getSpcCart);
router.get('/u/cart/TacTown', controller.getTacCart);
router.get('/u/cart/PotAc', controller.getPotCart);
router.get('/u/cart/BenG', controller.getBenCart);
router.get('/u/cart/Alcent', controller.getAlmuCart);

//Viewing Orders
router.get('/u/order', controller.getCustomerOrders);
router.get('/u/order/:orderID', controller.getOneCustomerOrder);

//Commenting

//Employees
//Gets
router.get('/r/ChzIT', controller.getRChzOrders);
router.get('/r/ChzIT/:orderID', controller.getOneRChzOrder);
router.get('/r/SpCity', controller.getRSpcOrders);
router.get('/r/SpCity/:orderID', controller.getOneRSpcOrder);
// router.get('/r/TacTown', controller.getRTacOrders);
// router.get('/r/PotAc', controller.getRPotOrders); 
// router.get('/r/BenG', controller.getRBenOrders);
// router.get('/r/AlCent', controller.getRAlmuOrders);


//Posts
router.post('/', controller.postLogin);
router.post('/newCheckout_submit', controller.postNewCheckout);
router.post('/newOrder_submit', controller.postNewOrder);
router.post('/editStatus_submit', controller.postEditStatus);

module.exports = router;