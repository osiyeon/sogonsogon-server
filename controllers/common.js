const mysql = require('mysql2/promise');
const dbconfig = require('../config/index').mysql;
const pool = mysql.createPool(dbconfig);

const controller = {
  async signUp(req, res, next) {
    try {
      var users = {
        email: req.body.email,
        password: req.body.password,
        nickname: req.body.nickname,
      };
      const [results] = await pool.query('INSERT INTO users SET ?', users);
      console.log('The user is: ', results);
      res.send({
        code: 200,
        success: 'user registerd successfully',
      });
    } catch (e) {
      next(e);
    }
  },
  async login(req, res, next) {
    try {
      var email = req.body.email;
      var password = req.body.password;
      const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (results.length > 0) {
        if (results[0].password == password) {
          res.send({
            code: 200,
            success: 'login successful',
          });
        } else {
          res.send({
            code: 204,
            success: 'Email and password does not match',
          });
        }
      } else {
        res.send({
          code: 204,
          success: 'Email does not exists',
        });
      }
    } catch (e) {
      next(e);
    }
  },
};

module.exports = controller;
