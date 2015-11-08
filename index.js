var extend = require('extend')

module.exports = function (options) {
  options = options || {}

  return function (server) {
    if (!server.db) throw new ReferenceError("db is undefined")
    var secret = options.secret
    delete options.secret

    var model = require('./model')(server.db, options)
    var auth = require('./lib/auth')(secret, options)
    var handler = require('./handler')(model, extend({ auth: auth }, options))
    var routes = require('./routes')(handler, options)

    return {
      name: 'accounts',
      model: model,
      schema: model.schema,
      handler: handler,
      routes: routes,
      auth: auth,
      serve: function (req, res) {
        return routes.match(req, res)
      }
    }
  }
}
