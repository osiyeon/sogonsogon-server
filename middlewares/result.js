const { response } = require("express");
const e = require("express");

const json = {
  async notFound(req, res, next) {
    res.status(404).json({ code: '404', message: '해당 API가 존재하지 않습니다.' });
  },
  async result(data, req, res, next) {
    console.log("data: ", data);

    if (data instanceof Error) {
      res.status(400).json({ message: data.message })
    } else if (data === `unauthorized_error`) {
      res.status(401).json({ message: `해당 API에 접근할 권한이 없습니다.` })
    } else {
      res.status(200).json({ ...data });
    }
  },
  async internalServerError(req, res, next) {
    res.status(500).json({ message: `서버 오류가 발생했습니다.` });
  },
};

module.exports = { json };
