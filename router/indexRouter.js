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
router.get('/u/comm/ChzIT', controller.getChzComments);
router.get('/u/comm/SpCity', controller.getSpcComments);
router.get('/u/comm/TacTown', controller.getTacComments);
router.get('/u/comm/PotAc', controller.getPotComments);
router.get('/u/comm/BenG', controller.getBenComments);
router.get('/u/comm/AlCent', controller.getAlmuComments);

router.get('/u/comm/new/ChzIT', controller.getNewCommentChz);
router.get('/u/comm/new/SpCity', controller.getNewCommentSpc);
router.get('/u/comm/new/TacTown', controller.getNewCommentTac);
router.get('/u/comm/new/PotAc', controller.getNewCommentPot);
router.get('/u/comm/new/BenG', controller.getNewCommentBen);
router.get('/u/comm/new/AlCent', controller.getNewCommentAlmu);

//Employees
//Gets
router.get('/r/ChzIT', controller.getRChzOrders);
router.get('/r/ChzIT/:orderID', controller.getOneRChzOrder);
router.get('/r/SpCity', controller.getRSpcOrders);
router.get('/r/SpCity/:orderID', controller.getOneRSpcOrder);
router.get('/r/TacTown', controller.getRTacOrders);
router.get('/r/TacTown/:orderID', controller.getOneRTacOrder);
router.get('/r/PotAc', controller.getRPotOrders);
router.get('/r/TacTown/:orderID', controller.getOneRPotOrder);
router.get('/r/BenG', controller.getRBenOrders);
router.get('/r/BenG/:orderID', controller.getOneRBenOrder);
router.get('/r/AlCent', controller.getRAlmuOrders);
router.get('/r/AlCent/:orderID', controller.getOneRAlmuOrder);

router.get('/r/emp/ChzIT', controller.getRChzEmployees);
router.get('/r/emp/SpCity', controller.getRSpcEmployees);
router.get('/r/emp/TacTown', controller.getRTacEmployees);
router.get('/r/emp/PotAc', controller.getRPotEmployees);
router.get('/r/emp/BenG', controller.getRBenEmployees);
router.get('/r/emp/AlCent', controller.getRAlmuEmployees);

router.get('/r/comm/ChzIT', controller.getRChzComments);
router.get('/r/comm/SpCity', controller.getRSpcComments);
router.get('/r/comm/TacTown', controller.getRTacComments);
router.get('/r/comm/PotAc', controller.getRPotComments);
router.get('/r/comm/BenG', controller.getRBenComments);
router.get('/r/comm/AlCent', controller.getRAlmuComments);

//Posts
router.post('/', controller.postLogin);
router.post('/newCheckout_submit', controller.postNewCheckout);
router.post('/newOrder_submit', controller.postNewOrder);
router.post('/editStatus_submit', controller.postEditStatus);
router.post('/newComment_submit_customer', controller.postNewCommentCustomer);

router.get('/register', controller.getRegister);
router.post('/newUser_submit', controller.postNewUser);

module.exports = router;