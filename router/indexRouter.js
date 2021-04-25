const express = require('express');
const router = express();
const controller = require('../controller/index');
const indexMiddleware = require('../middlewares/indexMiddleware');

// GETS
router.get('/', controller.getLogin);

//Customers
//Gets
router.get('/u/ChzIT', controller.getChzMenu);
router.get('/u/SpCity', controller.getSpcMenu);
router.get('/u/TacTown', controller.getTacMenu);
router.get('/u/PotAc', controller.getPotMenu);
router.get('/u/BenG', controller.getBenMenu);
router.get('/u/AlCent', controller.getAlmuMenu);

//Employees
//Gets
router.get('/r/ChzIT', controller.getChzOrders);

module.exports = router;