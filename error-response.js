var response = require('response')

module.exports = function (res, status, msg) {
  return response().status(status).json({ error: msg }).pipe(res)
}
