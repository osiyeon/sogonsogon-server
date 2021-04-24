const e = require('express')
const JWT = require('jsonwebtoken')
const config = require('../config')

module.exports = {
    sign(user) {
        const payload = {
            user_no: user.user_no,
            email: user.email
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
    seperateToken: async (token) => {
        
    }
}