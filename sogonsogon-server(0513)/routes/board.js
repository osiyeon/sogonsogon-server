const express = require('express')
const board = require('../controllers/board')

const router = express.Router()

const { checkToken } = require('../middlewares/auth')

// router.get('/', checkToken, common.ping)
router.post('/', checkToken, board.createBoard)
router.put('/', checkToken, board.editBoard)
router.get('/', checkToken, board.board)
router.delete('/', checkToken, board.removeBoard)
router.put('/like', checkToken, board.like)
router.get('/list/mine', checkToken, board.myBoards)
router.get('/list/all', checkToken, board.allOfBoards)
router.get('/list/best', checkToken, board.bestOfBoards)
router.get('/list/search', checkToken, board.searchedBoards)
// router.post('/', checkToken, common.login);

module.exports = router
