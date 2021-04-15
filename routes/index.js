const express = require('express');
const axios = require('axios');

const router = express.Router();
// GET / 라우터

router.get('/', (req, res) => {
	res.send('Hello, Express');
});

router.post('/signup', (req, res, next) =>{
	
})

module.exports = router;
