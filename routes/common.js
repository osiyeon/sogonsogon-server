const express = require('express');
const common = require('../controllers/common')

const router = express.Router();

const { checkToken } = require('../middlewares/auth')

router.get('/', (req, res) => {
	res.send('This is login&signUp');
});

router.get('/ping', checkToken, common.ping)
router.get('/user', checkToken, common.userInfo) //내 정보 조회
router.put('/user/editpassword', checkToken, common.editPassword) //비밀번호 변경
router.put('/user/editnickname', checkToken, common.editNickname) //닉네임 변경
router.post('/user', common.signUp) //회원가입
router.post('/login', common.login) //로그인

module.exports = router;
