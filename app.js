const express = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
app.set('port', process.env.PORT || 4000)

app.use(morgan('dev')) // 미들웨어
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/', require('./routes/common'))
app.use('/board', require('./routes/board'))
app.use('/comment', require('./routes/comment'))

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중')
})