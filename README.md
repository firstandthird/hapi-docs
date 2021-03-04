# hapi-docs

An indispensable [hapi](https://hapi.dev/) plugin that automatically documents the
major features of your hapi server

hapi-docs will document:

- routes

- server methods

- server events

- server plugins

- server auth schemes

## Installation

```console
npm install hapi-docs
```

## Usage

    hapi-docs is a standard hapi plugin, the quickest way to use it is to just register it like so:

```js
await server.register({
  plugin: require('hapi-docs'),
  options: {
    docsEndpoint: '/docs'
  }
});

```

and this will register a route at __/docs__ that will return server information in HTML form.  In addition this will decorate
your server with a _server.docs_ object that provides a set of functions that return document information.

- _server.docs.plugins()_

  Just returns the result of [_server.registrations_](https://hapi.dev/api/?v=20.1.0#-serverregistrations)

- _server.docs.events()_

  Will list all of your registered server events and listeners like so:

  ```js
  {
    log: { handlers: ['foo1', 'foo2'] },
    request: { handlers: ['debug'] },
    response: { handlers: ['(anonymous)'] },
    route: { handlers: ['foo2'] }
  }
  ```

- _server.docs.routes(options)_

  Will return a list of the server route configuration and corresponding joi validation data like so:

  ```js
  [{
    path: '/someRoute',
    method: 'post',
    payload: {
      type: 'object',
      children: {
        name: {
          type: 'string',
          flags: { presence: 'required' },
          invalids: ['']
        },
        hash: {
          type: 'string',
          flags: { presence: 'required' },
          invalids: ['']
        },
        id: {
          type: 'string',
          flags: { presence: 'required' },
          invalids: ['']
        }
      }
    }
  }]
  ```

  _options_ can contain a comma-separated list of _tags_  in string form, so that you only list out the routes that match that tag:

  ```js
  server.docs.routes({ tags: 'secure,api' });
  ```

  will only list info for routes that have the 'secure' or 'api' tag.

- _server.docs.auth(routeList)_

  Takes in a list of route configurations (which you can get by calling _server.docs.routes()_) and returns a corresponding list of auth strategies for the routes passed:

  ```js
     [{ name: 'local' }, { name: 'default' }]
  ```

- _server.docs.methods()_

  Returns the list of server methods and any associated meta-data. For example if you define a function with annotiations like so:

  ```js
  const annotated = function func3() {
    return 'scheme';
  };
  annotated.schema = {
    payload: {
      id: Joi.string().required(),
    }
  };
  annotated.description = 'A function that has some annotations';
  server.method('func3', annotated);
  ```

  Calling _server.docs.methods()_ returns:
  ```js
  [{
      name: 'func3',
      description: 'A function that has some annotations',
      schema: {
        type: 'object',
        children: {
          payload: {
            type: 'object',
            children: {
              id: {
                type: 'string',
                flags: { presence: 'required' },
                invalids: ['']
              },
            }
          }
        }
      }
    },]
  ```

- _server.docs.html()_

  This will return a tidy HTML page listing out the methods, routes, auth, events, and plugins data.

### Options

  - __getMeta__

    You can pass a getMeta function that returns an object containing additional information you want documented for your server, eg:

    ```js
    await server.register({
      plugin: require('../'),
      options: {
        getMeta: {
          routes: {
            '/some/{name}/page': {
              description: 'really this is a good route',
              tags: ['meta']
            }
          },
          methods: {
            'api.create': {
              description: 'a meta description',
              tags: ['meta']
            }
          },
          events: {
            response: {
              description: 'triggered when a route responds to a request'
            }
          },
          strategies: {
            local: {
              description: 'lets everyone in'
            },
            default: {
              description: 'nobody gets in'
            }
          }
        }
      }
    });
    ```

  - __docsEndpoint__

  You can pass an endpoint to register a route that allows you to fetch the HTML version of the server docs.  You can also pass __?tags=tag1,tag2__ in the request query to list only routes that match the indicated tags.

  ```js
  await server.register({
    plugin: require('../'),
    options: {
      docsEndpoint: '/docsEndpoint'
    }
  });
  ```

Then you can GET __/docsEndpoint__ and get back a page listing your server docs.
