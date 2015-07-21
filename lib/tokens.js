var jwt = require('jsonwebtoken')

module.exports = Tokens

function Tokens (secret, opts) {
  if (!(this instanceof Tokens)) return new Tokens(secret, opts)

  this.secret = secret
}

Tokens.prototype.sign = function (req, payload) {
  // payload = claims
  var token = jwt.sign(payload, this.secret)
  req.headers['Authorization'] = "Bearer " + token
  return token
}

Tokens.prototype.verify = function (req, cb) {
  if (!req.headers.authorization) {
    return new Error('No authorization header for storing the JWT was provided')
  }

  var token = req.headers.authorization.split(',')[0].split(' ')[1]
  var errorMsg = 'Failed to retrieve token from Authorization header'

  if (cb) {
    if (!token) return cb(new Error(errorMsg))
    return jwt.verify(token, this.secret, cb)
  }
  else {
    if (!token) return new Error(errorMsg)
    return jwt.verify(token, this.secret)
  }
}
