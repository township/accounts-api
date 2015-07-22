var formBody = require('body/form');

module.exports = function (secret, options) {
  var auth = {}
  var tokens = require('./tokens')(secret)

  auth.verify = function (req, callback) {
    var token;
    if (req.headers.authorization) {
      // ie "authorization: Bearer eyJhbGciOiJIUzI1NiIsI.eyJpc3MiO..."
      // TODO: handle case where bearer token is not first in csv authorization header
      token = req.headers.authorization.split(",")[0].split(" ")[1]
      return this.verifyToken(token, callback);
    } else if (req.headers.Session) {
      // ie "Cookie: access_token=eyJhbGciOiJIUzI1NiIsI.eyJpc3MiO..."
      // TODO: handle case where cookie token is not first in csv Cookie header
      token = req.headers.Session.split(",")[0].split("=")[1]
      return this.verifyToken(token, callback);
    } else {
      // This is signal that there is no auth nor session provided
      return callback(null, null)
    }
  }

  auth.verifyToken = function (req, callback) {
    tokens.verify(req, callback)
  }

  auth.login = function (req, res, account, cb) {
    var token = tokens.sign(req, { key: account.key })
    res.setHeader('Set-Cookie', 'access_token=' + token + '; ' + 'path=/; ')
    return cb(null, { session: token })
  }

  auth.logout = function (req, res, cb) {
    // TODO
  }

  auth.delete = function (req, cb) {
    // TODO
  }

  auth.handle = function (req, res, cb) {
    // TODO
  }

  auth.tokens = tokens
  return auth
}