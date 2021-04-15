const express = require('express');
const common = require('../controllers/common')

const router = express.Router();

router.get('/', (req, res) => {
	res.send('This is login&signUp');
});

router.post('/user', common.signUp);
router.post('/login', common.login);

module.exports = router;
