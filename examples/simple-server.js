var http = require('http')
var memdb = require('memdb')
var accounts = require('../index')(memdb(), {
  secret: 'so secret'
})

http.createServer(function (req, res) {
  accounts.serve(req, res)
}).listen(4444)
