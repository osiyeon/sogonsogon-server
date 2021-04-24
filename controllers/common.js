const mysql = require('mysql2/promise');
const dbconfig = require('../config/index').mysql;
const pool = mysql.createPool(dbconfig);

const utils = require('../utils')

const controller = {
  async ping(req, res, next) {
    try {
      console.log("ping:", req.users);
      res.json({
        user_no: req.users.user_no,
        email: req.users.email
      })
    } catch (e) {
      next(e)
    }
  },
  async signUp(req, res, next) {
    try {
      const email = req.body.email;
      const nickname = req.body.nickname;
      const [result] = await pool.query(`
        SELECT
        COUNT(*) AS 'count'
        FROM users
        WHERE enabled=1
        AND email = ? 
        OR nickname = ?
        `, [email, nickname])
      if (result[0].count > 0) throw res.json({ message: '이미 존재하는 계정입니다.' })

      const connection = await pool.getConnection(async (conn) => conn);
      try {
        const email = req.body.email
        const password = req.body.password
        const nickname = req.body.nickname
        await connection.beginTransaction()
        await connection.query(`
            INSERT INTO 
            users(email, password, nickname)
            VALUE
            (?, PASSWORD(?), ?);
            `, [email, password, nickname])
        await connection.commit()

        next(
          res.json({
            code: 200,
            success: '회원가입이 정상적으로 이루어졌습니다.',
          })
        )
      } catch (e) {
        await connection.rollback()
        next(e)
      } finally {
        connection.release()
      }
    } catch (e) {
      next(e)
    }
  },
  async login(req, res, next) {
    try {
      var email = req.body.email
      var password = req.body.password
      const [results] = await pool.query(`
          SELECT * 
          FROM users 
          WHERE email = ?
          AND password = PASSWORD(?)
      `, [email, password])
      if (results.length > 0) {
        const user_no = results[0].no
        const email = results[0].email
        const token = utils.sign({ user_no, email })
        res.json({
          code: 200,
          token: token,
        })
      } else {
        res.json({
          code: 204,
          message: '이메일이 존재하지 않습니다.',
        });
      }
    } catch (e) {
      next(e);
    }
  },
};

module.exports = controller;
