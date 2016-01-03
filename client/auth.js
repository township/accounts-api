module.exports = Auth

function Auth (client) {
  if (!(this instanceof Auth)) return new Auth(client)
  this.client = client
}

Auth.prototype.login = function (options, cb) {
  var self = this
  this.client.request('post', 'auth', options, function (err, res) {
    if (err) return cb(err)
    self.client.token = res.token
    cb(null, res)
  })
}

Auth.prototype.logout = function (cb) {
  var self = this
  this.client.request('get', 'auth/logout', function (err, res) {
    if (err) return cb(err)
    self.client.token = null
    cb(null, res)
  })
}
