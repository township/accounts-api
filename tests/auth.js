var test = require('tape')
var memdb = require('memdb')
var each = require('each-async')
var auth = require('../lib/auth')('test')
var fixtures = require('./fixtures/auth')

test('private object inaccessible to account without proper role', function (t) {
  var obj  = fixtures.objects[0]
  var account = fixtures.accounts[3]
  t.notOk(auth.isPublic(obj), 'example object is private')
  t.notOk(auth.checkRoles(obj.key, account), 'account does not have access')
  t.end()
})

test('collaborator can access private object if they have object key', function (t) {
  var obj  = fixtures.objects[0]
  var account = fixtures.accounts[2]
  t.notOk(auth.isPublic(obj), 'example object is private')
  t.ok(auth.checkRoles(obj.key, account), 'account has access')
  t.end()
})

test('owner can access private object if they have object key', function (t) {
  var obj  = fixtures.objects[1]
  var account = fixtures.accounts[1]
  t.notOk(auth.isPublic(obj), 'example object is private')
  t.ok(auth.checkRoles(obj.key, account), 'account has access')
  t.end()
})

test('admin can access all objects', function (t) {
  var account = fixtures.accounts[0]
  each(fixtures.objects, iterator, end)

  function iterator (obj, i, next) {
    t.ok(auth.checkRoles(obj.key, account), 'account has access')
    next()
  }

  function end () {
    t.end()
  }
})

test('public object is accessible by any account', function (t) {
  var obj  = fixtures.objects[2]
  t.ok(auth.isPublic(obj), 'example object is public')
  t.end()
})

test('require read:posts scope to read a post', function (t) {
  var account = fixtures.accounts[3]
  t.ok(auth.checkScopes(['read:posts'], account))
  t.end()
})

test('require create:posts scope to read a post', function (t) {
  var accountWithScope = fixtures.accounts[0]
  var accountWithoutScope = fixtures.accounts[1]
  t.ok(auth.checkScopes(['create:posts'], accountWithScope))
  t.notOk(auth.checkScopes(['create:posts'], accountWithoutScope))
  t.end()
})

test('create accounts model with custom scope', function (t) {
  var accounts = require('../model')(memdb(), {
    scopes: {
      posts: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            items: { type: 'string', enum: ['create', 'read', 'update', 'delete'] }
          }
        },
        default: { actions: ['create', 'read'] }
      }
    }
  })

  var data = { 
    login: { basic: { key: 'o4no34inro34int', password: 'poop' } },
    value: { email: 'cool@example.com', roles: { admin: true } }
  }

  accounts.create(data, function (err, account) {
    t.ok(account.scopes)
    t.ok(account.scopes.posts)
    t.ok(account.scopes.posts.actions)
    t.equals(account.scopes.posts.actions[0], 'create')
    t.equals(account.scopes.posts.actions[1], 'read')
    t.end()
  })
})

test('init accounts-api with custom scope', function (t) {
  var createAccounts = require('../index')({
    secret: 'test',
    scopes: {
      posts: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            items: { type: 'string', enum: ['create', 'read', 'update', 'delete'] }
          }
        },
        default: { actions: ['create', 'read'] }
      }
    }
  })

  var accounts = createAccounts({ db: memdb() })

  var data = { 
    login: { basic: { key: 'o4no34inro34int', password: 'poop' } },
    value: { email: 'cool@example.com', roles: { admin: true } }
  }

  accounts.model.create(data, function (err, account) {
    t.ok(account.scopes)
    t.ok(account.scopes.posts)
    t.ok(account.scopes.posts.actions)
    t.equals(account.scopes.posts.actions[0], 'create')
    t.equals(account.scopes.posts.actions[1], 'read')
    t.end()
  })
})