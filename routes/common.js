const express = require('express');
const common = require('../controllers/common')

const router = express.Router();

const { checkToken } = require('../middlewares/auth')

router.get('/', (req, res) => {
	res.send('This is login&signUp');
});

router.get('/ping', checkToken, common.ping)
router.post('/user', common.signUp);
router.post('/login', common.login);

module.exports = router;
