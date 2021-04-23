const express = require('express');
const router = express();
const controller = require('../controller/index');
const indexMiddleware = require('../middlewares/indexMiddleware');

// GETS
router.get('/', controller.getLogin);

router.get('/r/ChzIT', controller.getChzMenu);

module.exports = router;