const { env, defaultPassword } = require('../config')

const controller = {
    async hello(req, res) {
        res.send("say hello")
    }
}

module.exports = controller