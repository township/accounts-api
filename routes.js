module.exports = function (handler, options) {
  var router = require('match-routes')()
  var prefix = options.prefix || ''

  router.on(prefix + '/accounts', handler.index.bind(handler))
  router.on(prefix + '/accounts/:key', handler.item.bind(handler))
  router.on(prefix + '/auth', handler.authBasic.bind(handler))
  router.on(prefix + '/auth/:login', handler.authItem.bind(handler))
  router.on(prefix + '/auth/logout', handler.logout.bind(handler))

  return router
}