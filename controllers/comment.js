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
        next({ success: `ok`, result: {}, message: '댓글이 정상적으로 등록되었습니다.' })
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
        SELECT *
        FROM boards 
        WHERE no = ?
        AND enabled = 1
        `,
        [board_no]
      )

      if (results.length < 1) throw Error(`해당 게시글이 존재하지 않습니다.`)
      else {
        const [results1] = await pool.query(
          `
          SELECT c.*, u.nickname
          FROM comments c
          INNER JOIN users u
          ON u.no = c.user_no
          WHERE c.board_no = ?
          AND u.enabled = 1
          AND c.enabled = 1
          LIMIT ? OFFSET ? 
          `,
          [board_no, Number(count), Number(page * count)]
        )
        results1.map((result) => result.is_mine = user_no === result.user_no ? true : false)
        utils.formatting_datetime(results1)
        next({ comments: results1 })
      }
    } catch (e) {
      next(e)
    }
  },
  async removeComment(req, res, next) {
    try {
      const user_no = req.users.user_no
      const comment_no = req.query.comment_no

      const [results] = await pool.query(`
          SELECT
          COUNT(*) AS 'count'
          FROM comments
          WHERE no = ?
          AND user_no = ?
          AND enabled = 1
      `, [comment_no, user_no])

      if (results[0].count < 1) throw Error(`댓글이 존재하지 않거나 삭제 권한이 없습니다.`);
      const connection = await pool.getConnection(async conn => conn)
      try {
        await connection.beginTransaction();
        await connection.query(`
            UPDATE
            comments
            SET
            remove_datetime = NOW(),
            enabled = 0
            WHERE no = ?
            AND enabled = 1
        `, [comment_no])

        await connection.commit()
        next({ message: '댓글이 정상적으로 삭제되었습니다.' })
      } catch (e) {
        await connection.rollback()
        next(e)
      } finally {
        connection.release()
      }
    } catch (e) {
      next(e)
    }
  }
};

module.exports = controller;
