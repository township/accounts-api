var sublevel = require('subleveldown')
var extend = require('extend')

module.exports = function (db, options) {
  options = options || {}

  function accountdownBasic (db, prefix) {
    return require('accountdown-basic')(db, prefix, { key: 'key' })
  }

  options.roles = { 
    type: 'object',
    properties: extend({
      admin: { type: ['boolean', 'null'] },
      owner: { type: 'array', items: { type: 'string' } },
      collaborator: { type: 'array', items: { type: 'string' } }
    }, options.roles),
    default: {}
  }

  options.scopes = {
    type: 'object',
    properties: extend({
      accounts: {
        type: 'object',
        properties: {
          type: 'array',
          items: { type: 'string', enum: ['create', 'read', 'update', 'delete'] },
        },
        default: { actions: ['read'] }
      }
    }, options.scopes)
  }

  var options = extend({
    db: db,
    email: { type: 'string' },
    username: { type: ['string', 'null']},
    required: ['email'],
    indexKeys: ['email', 'username', 'profile'],
    login: {}
  }, options)

  var login = options.login = extend(options.login, { basic: accountdownBasic })
  var accountdown = require('accountdown')(sublevel(db, 'accounts'), { login: login })
  var accounts = require('accountdown-model')(accountdown, options)

  return accounts
}