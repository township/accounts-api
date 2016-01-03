var qs = require('querystring')
var request = require('request')

/*
* Replace AccountsAPIClient with name of your app
*/

module.exports = AccountsAPIClient

function AccountsAPIClient (options) {
  if (!(this instanceof AccountsAPIClient)) return new AccountsAPIClient(options)
  options = options || {}

  this.host = options.host || 'http://127.0.0.1:4243'
  this.token = null

  this.auth = require('./auth')(this)
  this.accounts = require('./accounts')(this)
}

AccountsAPIClient.prototype.request = function (method, path, params, cb) {
  var options = {}

  if (typeof params === 'function') {
    cb = params
    params = {}
  }

  if (method === 'get') {
    params = qs.stringify(params)
    options.uri = this.fullUrl(path, params)
    options.json = true
  } else {
    options.uri = this.fullUrl(path)
    options.json = options.body = params
  }

  options.method = method

  if (this.token) {
    options.headers = {
      'authorization': 'Bearer ' + this.token
    }
  } else {
    var id = null
    if (params.username) id = params.username
    if (params.email) id = params.email
    if (id && params.password) {
      options.headers = {
        'authorization': id + ':' + params.password
      }
    }
  }

  if (typeof cb === 'undefined') return request(options)
  else request(options, getResponse)

  function getResponse (error, response, body) {
    if (cb) {
      if (error) return cb(error)
      if (response.statusCode >= 400) return cb({ error: { status: response.statusCode } })
      return cb(null, response, body)
    }
  }
}

AccountsAPIClient.prototype.fullUrl = function fullUrl (path, params) {
  var url = this.host + '/' + path + '/'
  if (params) url += '?' + params
  console.log('url', url)
  return url
}

/**
 * Upload File objects taken from a FileList
 * @param  {String}   method Must be either `POST` (default) or `PUT`
 * @param  {String}   path   Path to upload endpoint
 * @param  {Object}   params Parameters object
 * @param  {Array}    params.files Array of File objects
 * @param  {Function} cb     Callback
 */
AccountsAPIClient.prototype.upload = function upload (method, path, params, cb) {
  var url = this.fullUrl(path)
  var body = new window.FormData()

  params.files.forEach(function (file, index) {
    body.append(index.toString, file)
  })

  request({
    method: method || 'POST',
    url: url,
    body: body
  }, function (err, response, body) {
    if (err) return cb(err)
    if (response.statusCode >= 400) return cb({ error: { status: response.statusCode } })
    return cb(null, response, JSON.parse(body))
  })
}

/**
 * Use this to plug in new handlers
 * @param {Object} opts Options
 * @param {String} opts.name Name to use for the new handler
 * @param {Function} opts.handler The new handler
 * @api public
 */
AccountsAPIClient.prototype.add = function add (opts) {
  this[opts.name] = opts.handler(this)
  return this
}
