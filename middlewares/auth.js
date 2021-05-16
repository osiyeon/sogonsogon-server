const mysql = require('mysql2/promise');
const dbconfig = require('../config/index').mysql;
const pool = mysql.createPool(dbconfig);
const auth = require('../utils');
const { json } = require('../middlewares/result');

module.exports = {
  async checkToken(req, res, next) {
    try {
      if (req.headers.authorization === undefined) throw Error('Unauthorized_error');
      const bearer_token = req.headers.authorization;
      const array = bearer_token.split(' ');
      const token = array[1];
      const verified = auth.verify(token);
      if (verified === null) next(`unauthorized_error`);
      const user_no = verified.user_no;
      const email = verified.email;
      // const region_no = verified.region_no
      // const sector_no = verified.sector_no
      const [results] = await pool.query(
        `
            SELECT
            COUNT(*) AS 'count'
            FROM users
            WHERE enabled = 1
            AND no = ?
            AND email = ?;
            `,
        [user_no, email]
      );

      if (results.length === 0) throw ({ result: 'Unauthorized_error' });
      req.users = { user_no, email };
      next();
    } catch (e) {
      next(e);
    }
  },
};
