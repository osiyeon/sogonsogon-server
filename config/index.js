const dotEnv = require('dotenv')

dotEnv.config()

module.exports = {
    port: process.env.PORT,
    mysql: {
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.name,
        port: process.env.port,
        connectionLimit: process.env.connectionLimit,
    },
}
