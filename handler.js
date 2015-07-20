var extend = require('extend')
var response = require('response')
var JSONStream = require('JSONStream')
var jsonBody = require('body/json')
var through = require('through2')
var filter = require('filter-object')

var errorResponse = require('./lib/error-response')
var tokens = require('./lib/tokens')

module.exports = AccountsApiHandler

function AccountsApiHandler (accounts, options) {
  if (!(this instanceof AccountsApiHandler)) {
    return new AccountsApiHandler(accounts, options)
  }
  this.tokens = tokens(options.secret || 's3cr3t_Pa55w0rd')
  this.model = accounts
}

/*
 * GET: return all accounts
 * POST: create a new account (admins only)
 */
AccountsApiHandler.prototype.index = function (req, res) {
  var self = this

  var decoded = this.verify(req, res)
  //if (!decoded) return

  /*
   *  Get list of accounts
   */

  if (req.method === 'GET') {
    return self.model.createReadStream({keys: false})
      .pipe(filterAccountDetails())
      .pipe(JSONStream.stringify())
      .pipe(res)
  }

  /*
   *  Create a new account
   */
  else if (req.method === 'POST') {
    jsonBody(req, res, function (err, body) {
      if (err) return errorResponse(res, 500, err)

      var opts = {
        login: { basic: { key: body.key, password: body.password } },
        value: filter(body, '!password')
      }

      self.model.create(body.key, opts, function (err, account) {
        if (err) return errorResponse(res, 500, 'Unable to create new user' + err)
        return response().status(200).json(account).pipe(res)
      })
    })
  }

  else return errorResponse(res, 405, 'request method not recognized: ' + req.method )
}

/*
 * GET: return an account
 * PUT: update an account (admins only)
 * DELETE: remove an account (admins only)
 */
AccountsApiHandler.prototype.item = function (req, res, opts) {
  var self = this

  var decoded = this.verify(req, res)
  //if (!decoded) return

  /*
   *  Get individual account
   */

  if (req.method === 'GET') {
    self.model.get(opts.params.key, function (err, account) {
      if (err) return errorResponse(res, 500, 'Could not retrieve the account')
      if (!decoded.admin) account = filter(account, ['*', '!email', '!admin'])
      return response().status(200).json(account).pipe(res)
    })
  }

  /*
   *  Update an account
   */

  else if (req.method === 'PUT') {
    if (!decoded.admin) return errorResponse(res, 401, 'Must be admin to update accounts')
    jsonBody(req, res, opts, function (err, body) {
      if (err) return errorResponse(res, 500, 'Could not parse the request\'s body' )
      self.model.get(opts.params.key, function (err, account){
        if (err) return errorResponse(res, 500, 'Could not retrieve account:' + err )
        account = extend(account, body)
        self.model.put(opts.params.key, account, function (err) {
          if (err) return errorResponse(res, 500, 'Server error' )
          response().status(200).json(account).pipe(res)
        })
      })
    })
  }

  /*
   *  Delete an account
   */

  else if (req.method === 'DELETE') {
    if (!decoded.admin) return errorResponse(res, 401, 'Must be admin to delete accounts')
    self.model.remove(opts.params.key, function (err) {
      if (err) return errorResponse(res, 500, 'Key does not exist' )
      return response().json(opts.params).pipe(res)
    })
  }

  else return errorResponse(res, 405, 'request method not recognized: ' + req.method )
}

AccountsApiHandler.prototype.verify = function (req, res) {
  var decoded
  try {
    decoded = this.tokens.verify(req)
  } catch(e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Error verifying web token: ' + e.message)
    }
    throw e
  }
  return decoded
}

// assumes no token is passed, and 'authorization' header contain login creds
AccountsApiHandler.prototype.auth = function (req, res, opts) {
  var self = this
  if (!req.headers.authorization) return errorResponse(res, 401, 'Unauthorized')



  var rawCreds = req.headers.authorization.split(':')
  var creds = { id: rawCreds[0], password: rawCreds[1] }
  self.model.findOne(creds.id, function (err, account) {
    if (err) return errorResponse(res, 401, 'Error finding account: ' + err)
    if (!account) return errorResponse(res, 401, 'Cannot find account with identifier: ' + creds.id)

    self.model.verify('basic', { key: account.key, password: creds.password },
      function (err, account) {
        if (err) return cb(err)
        if (account.admin) creds.admin = true
        var token = self.tokens.sign(req, creds)
        response().json({ token: token }).pipe(res)
      })
  })
}

AccountsApiHandler.prototype.authItem = function (req, res, opts) {
  var login = opts.params.login // ie 'twitter', 'facebook', etc
  // TODO: Finish this
}

/*
 * Helper functions
 */

function filterAccountDetails () {
  return through.obj(function iterator(chunk, enc, next) {
    this.push(filter(chunk, ['*', '!email', '!admin']))
    next()
  })
}


