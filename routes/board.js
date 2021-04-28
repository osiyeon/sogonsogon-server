const express = require('express');
const board = require('../controllers/board')

const router = express.Router();

const { checkToken } = require('../middlewares/auth')

// router.get('/', checkToken, common.ping)
router.post('/', checkToken, board.createBoard);
router.get('/list/all', checkToken, board.AllOfBoards)
// router.post('/', checkToken, common.login);

module.exports = router;
