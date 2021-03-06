# accounts-api [![Build Status](https://travis-ci.org/township/accounts-api.svg?branch=master)](https://travis-ci.org/township/accounts-api)


This app follows a few constraints to try and make it easy to plug into a node http server.

The goal is a simple API resource that can be used on its own or in other servers.

The file organization and approach is inspired in part by django's idea of apps.

## Usage

To use it, you'd include it in the server like this:

```
var http = require('http')
var response = require('response')
var level = require('level')
var db = level('db')
var accounts = require('accounts-api')(db)

var server = http.createServer(function (req, res) {
  /* 
  * if req.url matches a route, it will return, 
  * otherwise, another part of the application can respond 
  */
  if (accounts.serve(req, res)) return
  response().json({ message: 'hi' }).pipe(res)
})

server.listen(4444)
```

## Account roles

By default, there are three roles an account can have: admin, owner, collaborator

- `admin` 
  - is a boolean, and gives site-wide access
  - implies create, read, update, and delete scopes for all models
- `owner` 
  - is an array of keys for models that the account has created or for which the account has been granted owner status
  - implies create, read, update, and delete scopes on all models the account is an owner
- `collaborator` 
  - is an array of keys for models for which the account has been granted collaborator status
  - implies create, read, and update scopes on all models the account is a collaborator

Here's how you might check to see if a user is the owner of a model:

```
var access = auth.checkRoles(obj.key, account)
if (access && access.role === 'owner') {
  // do the things that owners can do
}
```

## Account scopes

Scopes are granular permissions for models or other arbitrary actions in your application.

By default there is an `accounts` scope, and all users are allowed to `read` accounts.

Here's an example of adding a custom `posts` scope to accounts so you can check if an account has the proper scope in other parts of your application:

```
var createAccounts = require('accounts-api')({
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
```

To check if an account has the proper scope:

```
auth.checkScopes(['read:posts', 'create:posts'], account)
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
  
