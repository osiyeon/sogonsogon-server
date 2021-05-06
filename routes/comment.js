const express = require('express')
const router = express.Router()
const comment = require('../controllers/comment')
const { checkToken } = require('../middlewares/auth')

router.post('/', checkToken, comment.createComment)
router.get('/list/all', checkToken, comment.AllOfComments)
router.delete('/', checkToken, comment.removeComment)

module.exports = router
