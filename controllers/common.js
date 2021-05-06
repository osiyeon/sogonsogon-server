const mysql = require('mysql2/promise');
const dbconfig = require('../config/index').mysql;
const pool = mysql.createPool(dbconfig);

const utils = require('../utils')

const controller = {
  async ping(req, res, next) {
    try {
      const key = req.query.key
      console.log("ping:", req.users);
      res.json({
        user_no: req.users.user_no,
        email: req.users.email,
        region_no: req.users.region_no,
        sector_no: req.users.sector_no
      })
    } catch (e) {
      next(e)
    }
  },
  async signUp(req, res, next) {
    try {
      const email = req.body.email
      const password = req.body.password
      const nickname = req.body.nickname
      const region_no = req.body.region_no
      const sector_no = req.body.sector_no

      const [ result ] = await pool.query(`
        SELECT
        COUNT(*) AS 'count'
        FROM users
        WHERE enabled=1
        AND email = ? 
        OR nickname = ?
        `, [email, nickname])
      if (result[0].count > 0) res.json({ message: '이미 존재하는 계정입니다.' })
      else {
        const connection = await pool.getConnection(async (conn) => conn);
        try {
  
          await connection.beginTransaction()
          await connection.query(`
              INSERT INTO 
              users(email, password, nickname, region_no, sector_no)
              VALUE
              (?, PASSWORD(?), ?, ?, ?);
              `, [email, password, nickname, region_no, sector_no])
          await connection.commit()
  
          res.json({
            code: 200,
            success: '회원가입이 정상적으로 이루어졌습니다.',
          })
        } catch (e) {
          await connection.rollback()
          next(e)
        } finally {
          connection.release()
        }
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
        const region_no = results[0].region_no
        const sector_no = results[0].sector_no
        const token = utils.sign({ user_no, email })
        res.json({
          token: token,
          region_no: region_no,
          sector_no: sector_no
        })
      } else {
        res.json({
          code: 204,
          message: '이메일 또는 비밀번호가 일치하지 않습니다.',
        })
      }
    } catch (e) {
      next(e);
    }
  },
  async userInfo(req, res, next) {
    try {
      const user_no = req.users.user_no

      const [results] = await pool.query(`
        SELECT no, email, nickname
        FROM users
        WHERE enabled=1
        AND no = ?;
      `,[user_no])
      if (results.length < 1) res.json({ message: '등록된 계정이 아닙니다.' })
      else {
        res.json({
          ...results[0],
        })
      }
    } catch (e) {
      next(e)
    }
  },
  async editNickname(req, res, next) {
    try {
      const user_no = req.users.user_no
      const nickname = req.body.nickname
      const [result] = await pool.query(`
          SELECT
          COUNT(*) AS 'count'
          FROM users
          WHERE enabled=1
          AND nickname = ?;
      `,[nickname])
      if (result[0].count > 0) res.json({ message: `이미 존재하는 닉네임입니다.` })
      else {
        const connection = await pool.getConnection(async (conn) => conn)
        try {
          await connection.beginTransaction();
          await connection.query(`
              UPDATE users
              SET
              nickname = ?
              where no = ?;
          `,[nickname, user_no])
          await connection.commit()
          res.json({
            message: '닉네임이 변경되었습니다',
          });
        } catch (e) {
          await connection.rollback()
          next(e);
        } finally {
          connection.release()
        }
      }
    } catch (e) {
      next(e)
    }
  },
  async editPassword(req, res, next) {
    try {
      const user_no = req.users.user_no
      const editpassword = req.body.password 
      const [ result ] = await pool.query(`
          SELECT
          COUNT(*) AS 'count'
          FROM users
          WHERE enabled=1
          AND no = ?
          AND password = PASSWORD(?);
      `, [ user_no, editpassword ]);
      if (result[0].count > 0) res.json({ message: `이전과 동일한 비밀번호로 변경하실 수 없습니다.` })
      else {
        const connection = await pool.getConnection(async (conn) => conn)
        try {
          await connection.beginTransaction()
          await connection.query(`
              UPDATE users
              SET
              password = PASSWORD(?)
              where no = ?;
          `, [ editpassword, user_no ])
          await connection.commit()
          res.json({
            message: '비밀번호가 변경되었습니다',
          })
        } catch (e) {
          await connection.rollback()
          next(e)
        } finally {
          connection.release()
        }
      }
    } catch (e) {
      next(e)
    }
  }

};

module.exports = controller;
