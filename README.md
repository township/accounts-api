# accounts-api [![Build Status](https://travis-ci.org/LukeSwart/accounts-api.svg?branch=master)](https://travis-ci.org/LukeSwart/accounts-api)


This app follows a few constraints to try and make it easy to plug into a node http server.

The goal is a simple API resource that can be used on its own or in other servers.

The file organization and approach is inspired in part by django's idea of apps.

## Usage

To use it, you'd include it in the server like this:

```
var http = require('http')
var response = require('response')
var levelup = require('levelup')
var db = levelup('db', { db: require('memdown') })

var server = http.createServer(function (req, res) {
  /* 
  * if req.url matches a route, it will return, 
  * otherwise, another part of the application can respond 
  */
  this.db = db
  var accounts = requires('accounts-api')(this)
  if (accounts.serve(req, res)) return
  response().json({ message: 'hi' }).pipe(res)
})

server.listen(4444)
```

## Todo

- decide how to handle static assets, and how they might be handled across the application

## Structure

- **index.js**
  - this module provides the model, handler, and routes modules of the app
  - it also provides a `serve` method that is used to match req.url to the app's routes
- **routes.js**
  - a simple router that takes the handler as an argument, and matches routes to handler methods
- **handler.js**
  - takes the model as an argument, and parses requests to perform operations with the model
- **model.js**
  - provides CRUD and other necessary actions like validation, indexing, etc. This is based on accountdown and leveldb.
  
