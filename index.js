module.exports = function (options) {
  options = options || {}

  return function (server) {
    var model = require('./model')(server.db, options)
    var handler = require('./handler')(model, options)
    var routes = require('./routes')(handler, options)

    return {
      name: 'accounts',
      model: model,
      schema: model.schema,
      handler: handler,
      routes: routes,
      serve: function (req, res) {
        return routes.match(req, res)
      }
    }
  }
}