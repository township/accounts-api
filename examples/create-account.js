var client = require('../client')({
  host: 'http://127.0.0.1:4444'
})

var info = { email: 'ok2@joeblow.com', password: 'o4gnoi4gn' }

client.accounts.create(info, function (err, res, account) {
  console.log(err, account)
})
