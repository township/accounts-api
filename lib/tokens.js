var jwt = require('jsonwebtoken')

var JsonWebTokenError = jwt.JsonWebTokenError

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
  // req.headers.Authorization = 'Bearer <token>'
  if (!req.headers.Authorization) throw new JsonWebTokenError("No authorization " +
    "header for storing the JWT was provided")
  var token = req.headers.Authorization.split(",")[0].split(" ")[1]
  if (cb) {
    if (!token) return cb("Failed to retrieve token from Authorization header")
    jwt.verify(token, this.secret, cb)
  } else {
    return jwt.verify(token, this.secret)
  }
}
