const express = require('express');
const router = express.Router();
const user = require('../controllers/user')


// GET / 라우터
router.get('/', user.hello);

module.exports = router;
