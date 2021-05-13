const mysql = require('mysql2/promise')
const dbconfig = require('../config/index').mysql
const pool = mysql.createPool(dbconfig)
const utils = require('../utils')

const controller = {
  async createComment(req, res, next) {
    try {
      const user_no = req.users.user_no
      const board_no = req.query.board_no
      const text = req.body.text
      const [ result1 ] = await pool.query(`
          SELECT
          COUNT(*) AS 'count'
          FROM comments
          WHERE enabled = 1
          AND board_no = ?
      `,[board_no, user_no])

      if (result1[0].count > 1) throw ({ success: `error`, result: {}, message: `댓글이 이미 존재합니다.`});
      
      const connection = await pool.getConnection(async (conn) => conn)
      try {
        await connection.beginTransaction()
        await connection.query(
          `
                    INSERT INTO 
                    comments(user_no, board_no, text)
                    VALUE (?, ?, ?);
                    `,
          [user_no, board_no, text]
        )
        await connection.commit()
        next({success: `ok`, result: {}, message: '댓글이 정상적으로 등록되었습니다.'})
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
  async allOfComments(req, res, next) {
    try {
      const user_no = req.users.user_no
      const board_no = req.query.board_no
      const page = req.query.page
      const count = req.query.count

      const [results] = await pool.query(
        `
        SELECT text
        FROM comments
        WHERE user_no = ?
        AND board_no = ?
        AND enabled = 1
        LIMIT ? OFFSET ? 
        `,
        [user_no, board_no, Number(count), Number(page * count)]
      )
      next({success: `ok`, result: {results}, message: '댓글이 정상적으로 등록되었습니다.'})
    } catch (e) {
      next(e)
    }
  },
  async removeComment(req,res,next){
    try{
      const board_no = req.query.board_no
      const comment_no = req.query.comment_no

      const [ result1 ] = await pool.query(`
          SELECT
          COUNT(*) AS 'count'
          FROM comments
          WHERE enabled = 1
          AND board_no = ?
          AND no = ?;
      `,[board_no, comment_no])

      if (result1[0].count < 1) throw ({ success: `error`, result: {}, message: `댓글이 존재하지 않습니다.`});

      const connection = await pool.getConnection(async conn => conn)
      try{
        await connection.beginTransaction();
        await connection.query(`
            UPDATE
            comments
            SET
            remove_datetime = NOW(),
            enabled = 0
            WHERE board_no = ?
            AND no = ?
        `,[board_no, comment_no])
        await connection.commit()
        next({success: `ok`, result: {}, message: '댓글이 정상적으로 삭제되었습니다.'})
      }catch(e){
        await connection.rollback()
        next(e)
      }finally{
        connection.release()
      }
    }catch(e){
      next(e)
    }
  }
};

module.exports = controller;
