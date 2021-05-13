const mysql = require('mysql2/promise');
const dbconfig = require('../config/index').mysql;
const pool = mysql.createPool(dbconfig);

const utils = require('../utils');

const controller = {
  async ping(req, res, next) {
    try {
      const key = req.query.key;
      console.log('ping:', req.users);
      res.json({
        user_no: req.users.user_no,
        email: req.users.email,
        region_no: req.users.region_no,
        sector_no: req.users.sector_no,
      });
    } catch (e) {
      next(e);
    }
  },
  async signUp(req, res, next) {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const nickname = req.body.nickname;
      const region_no = req.body.region_no;
      const sector_no = req.body.sector_no;
      const image = req.file.location;    

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
      if (result[0].count > 0) throw ({ success: `error`, result: {}, message: `이메일이나 닉네임이 이미 존재합니다.`});
      else {
        const connection = await pool.getConnection(async (conn) => conn);
        try {
          await connection.beginTransaction();
          await connection.query(
            `
              INSERT INTO 
              users(email, password, nickname, region_no, sector_no, image)
              VALUE
              (?, PASSWORD(?), ?, ?, ?, ?);
              `,
            [email, password, nickname, region_no, sector_no, image]
          );
          await connection.commit();
          next({success: `ok`, result: {}, message: `회원가입이 정상적으로 이루어졌습니다.`})
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
      var email = req.body.email;
      var password = req.body.password;
      const [results] = await pool.query(
        `
          SELECT * 
          FROM users 
          WHERE email = ?
          AND password = PASSWORD(?)
      `,
        [email, password]
      );
      if (results.length < 1) throw ({ success: `error`, result: {}, message: `이메일 또는 비밀번호가 일치하지 않습니다.`});
      else{
        const user_no = results[0].no;
        const email = results[0].email;
        const region_no = results[0].region_no;
        const sector_no = results[0].sector_no;
        const token = utils.sign({ user_no, email, region_no, sector_no });
        next({success: `ok`, result: {token}, message: `로그인이 정상적으로 이루어졌습니다.`})
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
        SELECT region_no, sector_no, email, nickname
        FROM users
        WHERE enabled=1
        AND no = ?;
      `,
        [user_no]
      );
        next({success: `ok`, result: {...results[0]}})
    } catch (e) {
      next(e);
    }
  },
  async editNickname(req, res, next) {
    try {
      const user_no = req.users.user_no;
      const nickname = req.body.nickname;
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
      if (result[0].count > 0) throw ({ success: `error`, result: {}, message: `이미 존재하는 닉네임입니다.`});
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
              where no = ?
          `,
            [nickname, user_no]
          );
          await connection.commit();
          next({success: `ok`, result: {}, message: `닉네임이 변경되었습니다.`})
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
      const editpassword = req.body.password;
      const connection = await pool.getConnection(async (conn) => conn);
      try {
        await connection.beginTransaction();
        await connection.query(
          `
              UPDATE users
              SET
              password = PASSWORD(?),
              update_datetime = NOW()
              where no = ?;
          `,
          [editpassword, user_no]
        );
        await connection.commit();
        next({success: `ok`, result: {}, message: `비밀번호가 변경되었습니다.`})
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
  async selectRegion1(req,res,next){
    try{
      const [result] = await pool.query(`
          SELECT bname
          FROM region_1
      ;`)
      next({success: `ok`,result: { result }})

    }catch(e){
      next(e);
    }
  },
  async selectRegion2(req,res,next){
    try{
      const region_1_no = req.query.region_1_no
      const [result] = await pool.query(`
          SELECT bname
          FROM region_2
          WHERE region_1_no = ?
      ;`,[region_1_no])
      next({success: `ok`,result: { result }})
    }catch(e){
      next(e);
    }
  },
  async selectRegion3(req,res,next){
    try{
      const region_2_no = req.query.region_2_no
      const [result] = await pool.query(`
          SELECT bname
          FROM region_3
          WHERE region_2_no = ?
      ;`,[region_2_no])
      next({success: `ok`,result: { result }})
    }catch(e){
      next(e);
    }
  },
  async selectRegion4(req,res,next){
    try{
      const region_3_no = req.query.region_3_no
      const [result] = await pool.query(`
          SELECT bname
          FROM region_4
          WHERE region_3_no = ?
      ;`,[region_3_no])
      next({success: `ok`,result: { result }})
    }catch(e){
      next(e);
    }
  },
  async selectSectors(req,res,next){
    try{
      const [result] = await pool.query(`
          SELECT sector_name
          FROM sectors
      ;`)
      next({success: `ok`,result: { result }})
    }catch(e){
      next(e);
    }
  },
};

module.exports = controller;
