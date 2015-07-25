var formBody = require('body/form')
var cookies = require('cookie-cutter')

module.exports = function (secret, options) {
  var auth = {}
  var tokens = require('./tokens')(secret)

  auth.verify = function (req, callback) {
    var token
    var authHeader = req.headers.authorization
    if (authHeader && authHeader.indexOf('Bearer') > -1) {
      token = authHeader.split('Bearer ')[1]
    }
    else if (req.headers.cookie) {
      token = cookies(req.headers.cookie).get('access_token')
    }
    if (token) return this.verifyToken(token, callback)
    return callback(null, null)
  }

  auth.verifyToken = function (token, callback) {
    tokens.verify(token, callback)
  }

  auth.login = function (req, res, payload, cb) {
    var token = tokens.sign(req, payload)
    res.setHeader('Set-Cookie', 'access_token=' + token + '; ' + 'path=/; ')
    return cb(null, token)
  }

  auth.logout = 
  auth.delete = function (res) {
    res.setHeader('Set-Cookie', 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT')
  }

  auth.handle = function (req, res, cb) {
    // TODO
  }

  auth.isPublic = function (obj) {
    if (obj.value) var obj = obj.value
    if (obj.private) return false
    return true
  }

  auth.checkRoles = function (key, decoded) {
    if (decoded.roles.admin) return { role: 'admin' }
    if (auth.checkKey(key, decoded.roles.owner)) return { role: 'owner' }
    if (auth.checkKey(key, decoded.roles.collaborator)) return { role: 'collaborator' }
    return false
  }

  auth.checkKey = function (key, role) {
    if (!role || !key) return false
    if (role.indexOf(key) > -1) return true
    return false
  }

  /*
  * expects account to have all scopes
  * example: auth.checkScopes(['read:posts', 'create:posts'], decodedToken)
  */
  auth.checkScopes = function (scopes, decoded) {
    var i=0
    var l = scopes.length
    for (i; i<l; i++) {
      if (!auth.checkScope(scopes[i], decoded)) return false
    }
    return true
  }

  auth.checkScope = function (scope, decoded) {
    var scopeToTest = scope.split(':')
    var action = scopeToTest[0]
    var key = scopeToTest[1]
    var accountScope = decoded.scopes[key]
    if (!accountScope) return false
    var actions = accountScope.actions.join(',')
    if (actions.indexOf(action) === -1) return false
    return true
  }

  auth.tokens = tokens
  return auth
}