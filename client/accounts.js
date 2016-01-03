var cuid = require('cuid')

module.exports = Accounts

function Accounts (client) {
  if (!(this instanceof Accounts)) return new Accounts(client)
  this.client = client
}

Accounts.prototype.get = function (username, options, cb) {
  return this.client.request('get', 'accounts/' + username, options, cb)
}

Accounts.prototype.list = function (options, cb) {
  return this.client.request('get', 'accounts', options, cb)
}

Accounts.prototype.create = function (options, cb) {
  options.key = options.key || cuid()
  return this.client.request('post', 'accounts', options, cb)
}

Accounts.prototype.update = function (username, options, cb) {
  if (typeof username === 'object') {
    cb = options
    options = username
    username = options.username
  }
  return this.client.request('put', 'accounts/' + username, options, cb)
}

Accounts.prototype.delete = function (username, cb) {
  return this.client.request('delete', 'accounts/' + username, {}, cb)
}
