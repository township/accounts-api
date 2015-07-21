module.exports = function (secret, options) {
  var auth = {}
  var tokens = require('./tokens')(secret)

  auth.verify = function (req, callback) {
    if (req.headers.authorization) return this.verifyToken(req, callback);
    return this.verifySession(req, callback)
  }

  auth.verifySession = function (req, callback) {
    // temporarily fails all the time because no cookies yet
    return callback(new Error('sessions not yet implemented'))
  }

  auth.verifyToken = function (req, callback) {
    tokens.verify(req, callback)
  }

  auth.tokens = tokens
  return auth
}