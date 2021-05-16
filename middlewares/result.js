const utils = require('../utils');

const json = {
  async notFound(req, res, next){
    next(utils.error(`notFound`))
  },
<<<<<<< HEAD
  async result(data, req, res, next) {
    if (data instanceof Error) {
      res.status(400).json({ message: data.message })
    } else if (data === `unauthorized_error`) {
      res.status(401).json({ message: `해당 API에 접근할 권한이 없습니다.` })
    } else {
      res.status(200).json({ ...data });
=======
  async result(data, req, res, next){
    if(data instanceof Error){
      res.status(data.code).json({message: data.message})
    }else{
      res.status(200).json({...data})
>>>>>>> bf73117efe3c566c9f3fdf287aba4fed094cc851
    }
  },
  async internalServerError(req, res, next) {
    next(utils.error(`internalServerError`))
  },
};

module.exports = { json };
