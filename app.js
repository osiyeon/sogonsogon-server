const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
//const path = require('path');

dotenv.config();

const app = express();
// app.set('port', process.env.PORT || 3000);

app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/', require('./routes/user'));
//app.use('/user', require('./routes/user'));

// app.use((req, res, next) =>{
//     res.status(404).send('Not Found');
// })

// app.use((req, res, next) =>{
//     console.log('모든 요청에 다 실행됩니다.');
//     next();
// })

// app.get('/', (req, res, next) => {
//     console.log('GET / 요청에서만 실행됩니다.');
//     next();
// }, (req, res) =>{ //두 번째 미들웨어에서 에러 발생
//     throw new Error('에러는 에러 처리 미들웨어로 갑니다.')
// })

// app.use((err, req, res, next) =>{ //에러 처리 미들웨어
//     console.error(err);
//     res.status(500).send(err.message);
// })

app.listen(process.env.PORT, async () => {
    console.log(` ${process.env.PORT} 번 포트에서 대기 중`);
})