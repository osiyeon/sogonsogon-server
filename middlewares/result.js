const json = {
  async notFound(req, res, next) {
    res.status(404).json({ code: '404', message: '해당 API가 존재하지 않습니다.' });
  },
  async result(data, req, res, next) {
    if (data.success == 'ok') {
      res.status(200).json({ message: data.message, result: data.result });
    }
    else{
      if (data.success == 'error') {
        res.status(400).json({ message: data.message });
      }
    }
  },
  async internalServerError(req, res, next){
    res.status(500).json({  message: `서버 오류가 발생했습니다.` });
  }
};

module.exports = { json };
