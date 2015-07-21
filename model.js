var sublevel = require('subleveldown')
var extend = require('extend')

module.exports = function (db, options) {
  options = options || {}

  function accountdownBasic (db, prefix) {
    return require('accountdown-basic')(db, prefix, { key: 'key' })
  }

  var options = extend({
    db: db,
    properties: {
      email: { type: 'string' },
      username: { type: ['string', 'null']},
      profile: { type: 'string' }
    },
    required: ['email'],
    indexKeys: ['email', 'username', 'profile']
  }, options)

  var login = extend(options.login, { basic: accountdownBasic })
  var accountdown = require('accountdown')(sublevel(db, 'accounts'), { login: login })
  var accounts = require('accountdown-model')(accountdown, options)

  return accounts
}