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
  param(data, key) {
    if (Object.keys(data).length === 0) throw error(`파라미터 없음`);
    else {
      if (data[key] === undefined) {
        throw error(`해당 파라미터( ${key} )가 없습니다. 입력해주세요`);
      } else {
        return data[key];
      }
    }
  },
  error(data) {
    const err = new Error();
    httpStatus.map((status) => {
      if (data === status.name) {
        err.code = status.code;
        err.message = status.defaultMessage;
        // console.log("~~", data, err.message);
      }
    });
    err.code = err.code || 400;
    err.message = err.message || data;
    // console.log(err.message);
    return err;
  },
};
