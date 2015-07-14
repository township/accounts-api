var test = require('tape')
var each = require('each-async')
var cuid = require('cuid')

var db = require('memdb')()
var accounts = require('../model')(db)

test('create an account', function (t) {
  var data = {
    login: { basic: { key: cuid(), password: 'test' } },
    value: { username: 'jane', email: 'jane@example.com'}
  }

  accounts.create(data, function (err, account) {
    t.notOk(err)
    t.ok(account)
    t.end()
  })
})

test('create sample account data', function (t) {
  var data = require('./fixtures/accounts')

  each(data, function (account, i, next) {
    accounts.create(account, function (err, account) {
      t.notOk(err)
      t.ok(account)
      next()
    })
  }, function () {
    t.end()
  })
})

test('get an account', function (t) {
  var data = {
    username: 'jane'
  }

  accounts.findOne(data.username, function (err, account) {
    t.notOk(err)
    t.ok(account)
    t.end()
  })
})

test('delete an account', function (t) {
  var data = {
    username: 'jane'
  }

  accounts.findOne(data.username, function (err, account) {
    t.notOk(err)
    t.ok(account)

    accounts.delete(account.key, function (err) {
      t.notOk(err)
      accounts.get(account.key, function (err, account) {
        t.notOk(account)
        t.ok(err)
        t.end()
      })
    })
  })
})
