const { error } = require('../utils');

const json = {
  async notFound(req, res, next) {
    next(error(`notFound`))
  },
  async result(data, req, res, next) {
    if (data instanceof Error) {
      console.log("Data: ", data);
      if (!Number.isInteger(data.code)) next(data)
      res.status(data.code).json({ message: data.message })
    } else {
      res.status(200).json({ ...data })
    }
  },
  async internalServerError(data, req, res, next) {
    if (!data) next(error(`internalServerError`))
    else {
      res.status(500).json({ message: data.message })
    }
  },
};

module.exports = { json };
