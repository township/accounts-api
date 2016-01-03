var extend = require('extend')
var response = require('response')
var JSONStream = require('JSONStream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')

var errorResponse = require('./lib/error-response')

module.exports = AccountsApiHandler

function AccountsApiHandler (accounts, options) {
  if (!(this instanceof AccountsApiHandler)) return new AccountsApiHandler(accounts, options)
  this.model = accounts
  var secret = options.secret || 's3cr3t_Pa55w0rd'
  this.auth = options.auth || require('./lib/auth')(secret)
}

/*
 * GET: return all accounts
 * POST: create a new account (admins only)
 */
AccountsApiHandler.prototype.index = function (req, res, opts) {
  var self = this

  this.auth.verify(req, function (err, decoded) {
    if (err) return errorResponse(res, 500, err)

    if (req.method === 'GET') {
      return self.model.createReadStream({keys: false})
        .pipe(filterAccountDetails())
        .pipe(JSONStream.stringify())
        .pipe(res)
    } else if (req.method === 'POST') {
      jsonBody(req, res, function (err, body) {
        if (err) return errorResponse(res, 500, err)

        var opts = {
          login: { basic: { key: body.key, password: body.password } },
          value: filter(body, '!password')
        }

        self.model.create(body.key, opts, function (err, account) {
          if (err) return errorResponse(res, 500, 'Unable to create new user' + err)
          self.auth.login(req, res, account, function (err, data) {
            console.log(err)
            if (err) return errorResponse(res, 500, err)
            return response().status(200).json(account).pipe(res)
          })
        })
      })
    }

    else return errorResponse(res, 405, 'request method not recognized: ' + req.method)
  })
}

/*
 * GET: return an account
 * PUT: update an account (admins only)
 * DELETE: remove an account (admins only)
 */
AccountsApiHandler.prototype.item = function (req, res, opts) {
  var self = this

  this.auth.verify(req, function (err, decoded) {
    var unauthorized = (err || !decoded)

    /*
     *  Get individual account
     */

    if (req.method === 'GET') {
      self.model.get(opts.params.key, function (err, account) {
        if (err) return errorResponse(res, 500, 'Could not retrieve the account')
        if (!decoded || !decoded.admin) account = filter(account, ['*', '!email', '!admin', '!roles', '!scopes'])
        return response().status(200).json(account).pipe(res)
      })
    } else if (req.method === 'PUT') {
      if (unauthorized) return errorResponse(res, 401, 'Unauthorized')

      jsonBody(req, res, function (err, body) {
        if (err) return errorResponse(res, 500, 'Could not parse the request body')

        self.model.get(opts.params.key, function (err, account) {
          if (err) return errorResponse(res, 500, 'Could not retrieve account:' + err)
          account = extend(account, body)
          self.model.put(opts.params.key, account, function (err) {
            if (err) return errorResponse(res, 500, 'Server error')
            response().status(200).json(account).pipe(res)
          })
        })
      })
    } else if (req.method === 'DELETE') {
      if (unauthorized) return errorResponse(res, 401, 'Unauthorized')

      self.model.remove(opts.params.key, function (err) {
        if (err) return errorResponse(res, 500, 'Key does not exist')
        return response().json(opts.params).pipe(res)
      })
    }

    else return errorResponse(res, 405, 'request method not recognized: ' + req.method)
  })
}

// assumes no token is passed, and 'authorization' header contain login creds
AccountsApiHandler.prototype.authBasic = function (req, res, opts) {
  var self = this
  if (!req.headers.authorization) return errorResponse(res, 401, 'Unauthorized')

  var rawCreds = req.headers.authorization.split(':')
  var creds = { id: rawCreds[0], password: rawCreds[1] }

  self.model.findOne(creds.id, function (err, account) {
    if (err) return errorResponse(res, 401, 'Error finding account: ' + err)
    if (!account) return errorResponse(res, 401, 'Cannot find account with identifier: ' + creds.id)
    var verifyOptions = { key: account.key, password: creds.password }

    self.model.verify('basic', verifyOptions, function (err, ok, key) {
      if (err) return errorResponse(res, 500, err)
      self.auth.login(req, res, account, function (err, token) {
        if (err) return errorResponse(res, 500, err)
        return response().status(200).json({ token: token, key: account.key }).pipe(res)
      })
    })
  })
}

AccountsApiHandler.prototype.authItem = function (req, res, opts) {
  // TODO: Finish this
  // var login = opts.params.login
}

AccountsApiHandler.prototype.logout = function (req, res, opts) {
  this.auth.logout(res)
  res.writeHead(302, { 'Location': '/' })
  return res.end()
}

/*
 * Helper functions
 */
function filterAccountDetails () {
  return through.obj(function iterator (chunk, enc, next) {
    this.push(filter(chunk, ['*', '!email', '!roles', '!scopes']))
    next()
  })
}
