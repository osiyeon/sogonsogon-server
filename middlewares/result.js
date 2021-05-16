const utils = require('../utils');

const json = {
  async notFound(req, res, next){
    next(utils.error(`notFound`))
  },
  async result(data, req, res, next){
    // console.log(data)
    if(data instanceof Error){
      res.status(data.code).json({message: data.message})
    }else{
      res.status(200).json({...data})
    }
  },
  async internalServerError(req, res, next) {
    next(utils.error(`internalServerError`))
  },
};

module.exports = { json };
