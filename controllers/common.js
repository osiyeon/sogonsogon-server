const mysql = require('mysql2/promise');
const dbconfig = require('../config/index').mysql;
const pool = mysql.createPool(dbconfig);
const { param, error, sign } = require('../utils');

const controller = {
  async ping(req, res, next) {
    try {
      const key = req.query.key;
      console.log('ping:', req.users);
      res.json({
        user_no: req.users.user_no,
        email: req.users.email,
        region_bcode: req.users.region_bcode,
        sector_no: req.users.sector_no,
      });
    } catch (e) {
      next(e);
    }
  },
  async signUp(req, res, next) {
    try {
      const body = req.body;
      const email = param(body, 'email');
      const password = param(body, 'password');
      const nickname = param(body, 'nickname');
      const region_bcode = param(body, 'region_bcode');
      const sector_no = param(body, 'sector_no');
      const image = param(req.file, 'location')

      const [result] = await pool.query(
        `
        SELECT
        COUNT(*) AS 'count'
        FROM users
        WHERE enabled=1
        AND email = ? 
        OR nickname = ?
        `,
        [email, nickname]
      );
      if (result[0].count > 0) throw error(`이메일이나 닉네임이 이미 존재합니다.`);
      else {
        const connection = await pool.getConnection(async (conn) => conn);
        try {
          await connection.beginTransaction();
          await connection.query(
            `
              INSERT INTO 
              users(email, password, nickname, region_bcode, sector_no, image)
              VALUE
              (?, PASSWORD(?), ?, ?, ?, ?);
              `,
            [email, password, nickname, region_bcode, sector_no, image]
          );
          await connection.commit();
          next({ message: `회원가입이 정상적으로 이루어졌습니다.` })
        } catch (e) {
          await connection.rollback();
          next(e);
        } finally {
          connection.release();
        }
      }
    } catch (e) {
      next(e);
    }
  },
  async login(req, res, next) {
    try {
      const body = req.body
      let email = param(body, 'email')
      const password = param(body, 'password')
      const [results] = await pool.query(
        `
          SELECT * 
          FROM users 
          WHERE email = ?
          AND password = PASSWORD(?)
      `,
        [email, password]
      );
      if (results.length < 1) throw error(`이메일 또는 비밀번호가 일치하지 않습니다.`)
      else {
        const user_no = results[0].no;
        const email = results[0].email;
        const region_bcode = results[0].region_bcode;
        const sector_no = results[0].sector_no;
        const token = sign({ user_no, email, region_bcode, sector_no });
        next({ token, region_bcode, sector_no })
      }
    } catch (e) {
      next(e);
    }
  },
  async userInfo(req, res, next) {
    try {
      const user_no = req.users.user_no;

      const [results] = await pool.query(
        `
        SELECT 
        no,
        region_bcode, 
        sector_no, 
        email, 
        nickname
        FROM users
        WHERE enabled=1
        AND no = ?;
      `,
        [user_no]
      );

      next({ ...results[0] })
    } catch (e) {
      next(e);
    }
  },
  async editNickname(req, res, next) {
    try {
      const user_no = req.users.user_no;
      const nickname = param(req.body, 'nickname')
      const [result] = await pool.query(
        `
          SELECT
          COUNT(*) AS 'count'
          FROM users
          WHERE enabled=1
          AND nickname = ?;
      `,
        [nickname]
      );
      if (result[0].count > 0) throw error(`이미 존재하는 닉네임입니다.`);
      else {
        const connection = await pool.getConnection(async (conn) => conn);
        try {
          await connection.beginTransaction();
          await connection.query(
            `
              UPDATE users
              SET
              nickname = ?,
              update_datetime = NOW()
              WHERE no = ?
          `,
            [nickname, user_no]
          );
          await connection.commit();
          next({ message: `닉네임이 변경되었습니다.` })
        } catch (e) {
          await connection.rollback();
          next(e);
        } finally {
          connection.release();
        }
      }
    } catch (e) {
      next(e);
    }
  },
  async editPassword(req, res, next) {
    try {
      const user_no = req.users.user_no;
      const editpassword = param(req.body, 'password')
      const connection = await pool.getConnection(async (conn) => conn);
      try {
        await connection.beginTransaction();
        await connection.query(
          `
              UPDATE users
              SET
              password = PASSWORD(?),
              update_datetime = NOW()
              WHERE no = ?;
          `,
          [editpassword, user_no]
        );
        await connection.commit();
        next({ message: `비밀번호가 변경되었습니다.` })
      } catch (e) {
        await connection.rollback();
        next(e);
      } finally {
        connection.release();
      }
    } catch (e) {
      next(e);
    }
  },
  async selectRegion1(req, res, next) {
    try {
      const [result] = await pool.query(`
          SELECT *
          FROM region_1
      ;`)
      next({ result })
    } catch (e) {
      next(e);
    }
  },
  async selectRegion2(req, res, next) {
    try {
      const region_1_no = param(req.query, 'region_1_no')
      const [results] = await pool.query(`
          SELECT *
          FROM region_2
          WHERE region_1_no = ?
      ;`, [region_1_no])
      next({ results })
    } catch (e) {
      next(e);
    }
  },
  async selectRegion3(req, res, next) {
    try {
      const region_2_no = param(req.query, 'region_2_no')
      const [results] = await pool.query(`
          SELECT *
          FROM region_3
          WHERE region_2_no = ?
      ;`, [region_2_no])
      next({ results })
    } catch (e) {
      next(e);
    }
  },
  async selectRegion4(req, res, next) {
    try {
      const region_3_no = param(req.query, 'region_3_no')
      const [results] = await pool.query(`
          SELECT *
          FROM region_4
          WHERE region_3_no = ?
      ;`, [region_3_no])
      next({ results })
    } catch (e) {
      next(e);
    }
  },
  async selectSectors(req, res, next) {
    try {
      const [results] = await pool.query(`
          SELECT *
          FROM sectors
      ;`)
      next({ results })
    } catch (e) {
      next(e)
    }
  },
  async getName(req, res, next) {
    try {
      const query = req.query
      const region_bcode = param(query, 'region_bcode')
      const sector_no = param(query, 'sector_no')

      const [region] = await pool.query(`
      SELECT 
      r2.bname AS r2_bname,
      r3.bname AS r3_bname, 
      r4.bname AS r4_bname 
      FROM region_4 AS r4
      INNER JOIN region_3 AS r3 
      ON r3.no = r4.region_3_no
      INNER JOIN region_2 AS r2 
      ON r2.no = r3.region_2_no
      WHERE r4.bcode = ?;
      `, [region_bcode])

      const [sector] = await pool.query(`
      SELECT sector_name AS sector_name
      FROM sectors
      WHERE no = ?;
      `, [sector_no])

      if (region.length === 0 || sector.length === 0) throw error(`잘못된 region_bcode 또는 잘못된 sector_no 입니다.`)
      next({ ...region[0], ...sector[0] })

    } catch (e) {
      next(e)
    }
  }
};

module.exports = controller;
