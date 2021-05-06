const e = require('express')
const JWT = require('jsonwebtoken')
const dayjs = require('dayjs')
const config = require('../config')

module.exports = {
    sign(user) {
        const payload = {
            user_no: user.user_no,
            email: user.email,
            // region_no: user.region_no,
            // sector_no: user.sector_no
        }
        const token = JWT.sign(payload, config.jwt.secretKey, config.jwt.options)
        return token
    },
    verify (token){
        let decoded
        try {
            decoded = JWT.verify(token, config.jwt.secretKey)
        } catch (err) {
            if(err.message === 'jwt expired') {
                console.log('expired token')
                return null
            } else {
                console.log('invalid token');
                return null
            }
        }
        return decoded
    },
    formatting_datetime (results) {
        results.map((result) => {
            result.create_datetime = dayjs(result.create_datetime).format("YYYY년 MM월 DD일 HH시 mm분 ss초")
            result.update_datetime = result.update_datetime === null ? null: dayjs(result.update_datetime).format("YYYY년 MM월 DD일 HH시 mm분 ss초")
            result.remove_datetime = result.remove_datetime === null ? null: dayjs(result.remove_datetime).format("YYYY년 MM월 DD일 HH시 mm분 ss초")
        })
        return results
    },
}