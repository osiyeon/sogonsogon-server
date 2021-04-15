const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const common = require('./routes/common');

dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3000);

app.use(morgan('dev')) // 미들웨어
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/', common);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중');
})