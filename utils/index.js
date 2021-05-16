const e = require('express');
const JWT = require('jsonwebtoken');
const dayjs = require('dayjs');
const config = require('../config');
const { httpStatus } = require('../config/httpStatusCode');
module.exports = {
  sign(user) {
    const payload = {
      user_no: user.user_no,
      email: user.email,
      // region_bcode: user.region_bcode,
      // sector_no: user.sector_no
    };
    const token = JWT.sign(payload, config.jwt.secretKey, config.jwt.options);
    return token;
  },
  verify(token) {
    let decoded;
    try {
      decoded = JWT.verify(token, config.jwt.secretKey);
    } catch (err) {
      if (err.message === 'jwt expired') {
        // next(err)
        // // throw Error(`expired token`)
        // console.log('expired token')
        return null;
      } else {
        // console.log('invalid token');
        return null;
      }
    }
    return decoded;
  },
  formatting_datetime(results) {
    results.map((result) => {
      result.create_datetime = dayjs(result.create_datetime).format('YYYY-MM-DDTHH:mm:ss');
      if (result.update_datetime !== undefined)
        result.update_datetime =
          result.update_datetime === null
            ? null
            : dayjs(result.update_datetime).format('YYYY-MM-DDTHH:mm:ss');
      result.remove_datetime =
        result.remove_datetime === null
          ? null
          : dayjs(result.remove_datetime).format('YYYY-MM-DDTHH:mm:ss');
    });
    return results;
  },
  error(data) {
    const err = new Error();
    httpStatus.map((status) => {
        if(data === status.name){
            err.code = status.code
            err.message = status.defaultMessage
        }
    });
    err.code = err.code || 400;
    err.message = err.message || data
    return err;
  },
};
