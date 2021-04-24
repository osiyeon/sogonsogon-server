const dotEnv = require('dotenv')

dotEnv.config()

module.exports = {
    port: process.env.PORT,
    mysql: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.MYSQL_DB,
        port: process.env.DB_PORT,
        connectionLimit: process.env.DB_CONNECT,
    },
    jwt: {
        secretKey: process.env.JWT_SECRET_KEY,
        options: { 
            algorithm: process.env.JWT_ALGORITHM,
            expiresIn: process.env.JWT_EXPIRESIN,
            issuer: process.env.JWT_ISSUER
        }
    }
}
