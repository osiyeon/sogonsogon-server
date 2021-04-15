// const { env, defaultPassword } = require('../config')
const mysql = require('mysql2/promise');
const dbconfig = require('../config/index').mysql
const pool = mysql.createPool(dbconfig)

const controller = {
    async ping(req, res) {
        res.status(201).json({
            success:1,
            message: "say hello"
        })
    },
    async createStudent(req, res) {
        try{
            body = req.body;
            const [ result ] = await pool.query(`
            INSERT INTO
            students(name, email, password, age, region)
            VALUE
            (?, ?, ?, ?, ?)
            `, [body.name, body.email, body.password, body.age, body.region])

            const [ result1 ] = await pool.query(`
            SELECT
            name, email, password, age
            FROM students
            `)

            res.status(201).json({
                result: result1,
                message: "it's okay"
            })    
        } catch (e) {
            res.json({
                message: e
            })
        }

    }

}

module.exports = controller