module.exports = {
  accounts: [
    {
      email: 'test@example.com',
      roles: {
        admin: true
      },
      scopes: {
        accounts: {
          actions: ['create', 'read', 'update', 'delete']
        },
        posts: {
          actions: ['create', 'read', 'update', 'delete']
        }
      }
    },
    {
      email: 'test@example.com',
      roles: {
        owner: ['testkey']
      },
      scopes: {
        accounts: {
          actions: ['read']
        }
      }
    },
    {
      email: 'test@example.com',
      roles: {
        collaborator: ['examplekey']
      },
      scopes: {
        posts: {
          actions: ['create', 'read']
        }
      }
    },
    {
      email: 'test@example.com',
      roles: {},
      scopes: {
        posts: {
          actions: ['create', 'read']
        }
      }
    }
  ],
  objects: [
    {
      title: 'example object',
      key: 'examplekey',
      private: true
    },
    {
      title: 'test object',
      key: 'testkey',
      private: true
    },
    {
      title: 'public object',
      key: 'publickey'
    }
  ]
}
