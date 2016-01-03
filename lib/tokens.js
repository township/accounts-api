var jwt = require('jsonwebtoken')

module.exports = Tokens

function Tokens (secret, opts) {
  if (!(this instanceof Tokens)) return new Tokens(secret, opts)

  this.secret = secret
}

Tokens.prototype.sign = function (req, payload) {
  var token = jwt.sign(payload, this.secret)
  req.headers['Authorization'] = 'Bearer ' + token
  return token
}

Tokens.prototype.verify = function (token, cb) {
  if (cb) {
    if (!token) return cb('Failed to retrieve token from Authorization header')
    jwt.verify(token, this.secret, cb)
  } else {
    return jwt.verify(token, this.secret)
  }
}
