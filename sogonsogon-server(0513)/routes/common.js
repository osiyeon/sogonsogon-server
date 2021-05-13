const express = require('express');
const router = express.Router();
const { checkToken } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const common = require('../controllers/common');

router.get('/ping', checkToken, common.ping);

router.post('/login', common.login); //로그인
router.get('/user', checkToken, common.userInfo); //내 정보 조회
router.put('/user/editpassword', checkToken, common.editPassword); //비밀번호 변경
router.put('/user/editnickname', checkToken, common.editNickname); //닉네임 변경

router.post('/user', upload.single('img'), common.signUp); //회원가입
router.get('/user/selectregion1', common.selectRegion1); //지역선택
router.get('/user/selectregion2', common.selectRegion2); //지역선택
router.get('/user/selectregion3', common.selectRegion3); //지역선택
router.get('/user/selectregion4', common.selectRegion4); //지역선택
router.get('/user/selectsectors', common.selectSectors); //지역선택
router.get('/user/getName', common.getName)
module.exports = router;
