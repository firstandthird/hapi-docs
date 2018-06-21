const test = require('tap').test;
const Hapi = require('hapi');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const boom = require('boom');

test('creates a json data object for each route', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  server.route({
    method: 'POST',
    path: '/appian',
    config: {
      validate: {
        payload: {
          name: Joi.string().required(),
          hash: Joi.string().required(),
          id: Joi.string().required()
        }
      }
    },
    handler(request, h) {
      return 'of the mack';
    }
  });
  server.route({
    method: 'GET',
    path: '/khyber',
    config: {
      tags: ['secure'],
      notes: 'connects Pakistan and Afghanistan'
    },
    handler(request, h) {
      return 'of the jedi';
    }
  });
  server.route({
    method: 'GET',
    path: '/appian',
    config: {
      validate: {
        query: {
          name: Joi.string(),
          hash: Joi.string(),
          id: Joi.string()
        }
      }
    },
    handler(request, h) {
      return 'of the king';
    }
  });
  const response = server.docs.routes();

  t.deepEqual(response[0], {
    path: '/appian',
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
  }, 'returns validation specs for POST payloads');

  t.deepEqual(response[1], {
    path: '/appian',
    method: 'get',
    query: {
      type: 'object',
      children: {
        name: {
          type: 'string',
          invalids: ['']
        },
        hash: {
          type: 'string',
          invalids: ['']
        },
        id: {
          type: 'string',
          invalids: ['']
        },
      }
    }
  }, 'return basic route info and validation specs for query');

  t.deepEqual(response[2], {
    path: '/khyber',
    method: 'get',
    tags: ['secure'],
    notes: 'connects Pakistan and Afghanistan'
  }, 'returns the notes and tags for the route');

  t.end();
});

test('the "tags" option will only return routes with the specified tag', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  server.route({
    method: 'POST',
    path: '/appian',
    config: {
      tags: ['secure']
    },
    handler(request, h) {
      return 'of the mack';
    }
  });
  server.route({
    method: 'POST',
    path: '/camino',
    config: {
      tags: ['api']
    },
    handler(request, h) {
      return 'of the mack';
    }
  });
  server.route({
    method: 'GET',
    path: '/khyber',
    config: {
      tags: ['development']
    },
    handler(request, h) {
      return 'of the jedi';
    }
  });
  server.route({
    method: 'GET',
    path: '/appian',
    config: {
      tags: ['secure']
    },
    handler(request, h) {
      return 'of the king';
    }
  });
  const response = server.docs.routes({ tags: 'secure,api' });
  t.deepEqual(response, [{
    path: '/appian',
    method: 'post',
    tags: ['secure'],
  }, {
    path: '/appian',
    method: 'get',
    tags: ['secure'],
  }, {
    path: '/camino',
    method: 'post',
    tags: ['api'],
  }], 'only returns info for routes matching the specified tags');
  t.end();
});

test('documents both global and local auth configs', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  server.auth.scheme('theDefaultScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('default', 'theDefaultScheme');
  server.auth.default('default');
  server.auth.scheme('theLocalScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('local', 'theLocalScheme');
  server.route({
    method: 'POST',
    path: '/appian',
    config: {
      auth: 'local'
    },
    handler(request, h) {
      return 'of the mack';
    }
  });
  server.route({
    method: 'GET',
    path: '/appian',
    config: {
      validate: {
        query: {
          name: Joi.string(),
          hash: Joi.string(),
          id: Joi.string()
        }
      }
    },
    handler(request, h) {
      return 'of the king';
    }
  });
  const response = server.docs.routes();
  t.equal(response[0].auth.strategies[0], 'local', 'routes decorates with default strat');
  t.equal(response[1].auth.strategies[0], 'default', 'routes decorates with default strat');
  t.end();
});

test('takes in a custom validation', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  server.route({
    method: 'POST',
    path: '/appian',
    config: {
      plugins: {
        'hapi-api-docs': {
          validate: {
            payload: {
              name: Joi.string().required(),
              hash: Joi.string().required(),
              id: Joi.string().required()
            }
          }
        }
      }
    },
    handler(request, h) {
      return 'of the mack';
    }
  });
  server.route({
    method: 'POST',
    path: '/autobahn',
    config: {
      plugins: {
        'hapi-api-docs': {
          validate: {
            payload: {
              pName: Joi.string().required(),
              pHash: Joi.string().required(),
              pid: Joi.string().required()
            }
          }
        }
      },
      validate: {
        payload: {
          name: Joi.string().required(),
          hash: Joi.string().required(),
          id: Joi.string().required()
        }
      }
    },
    handler(request, h) {
      return 'of the mack';
    }
  });
  const response = server.docs.routes();
  t.isA(response[0].payload, 'object', 'includes manual validation schema');
  t.deepEqual(
    Object.keys(response[1].payload.children),
    ['pName', 'pHash', 'pid'],
    'manual schema overrides schema specified by config.validate');
  t.end();
});

test('server.docs.methods() returns list of methods', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  server.method('topLevel', () => { 'hi there'; });
  server.method('nestedLevel.func1', () => { 'hi there'; });
  server.method('nestedLevel.func2', () => { 'hi there'; });
  server.method('nestedLevel.secondLevel.func1', () => { 'hi there'; });
  server.method('nestedLevel.secondLevel.func2', () => { 'hi there'; });
  const annotated = function func3() {
    return 'scheme';
  };
  annotated.schema = {
    payload: {
      name: Joi.string().required(),
      hash: Joi.string().required(),
      id: Joi.string().required()
    }
  };
  annotated.description = 'A function that has some annotations';
  server.method('func3', annotated);
  const methods = server.docs.methods();
  t.match(methods, [
    {
      name: 'func3',
      description: 'A function that has some annotations',
      schema: {
        type: 'object',
        children: {
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
              },
            }
          }
        }
      }
    },
    { name: 'nestedLevel.func1' },
    { name: 'nestedLevel.func2' },
    { name: 'nestedLevel.secondLevel.func1' },
    { name: 'nestedLevel.secondLevel.func2' },
    { name: 'topLevel' }
  ]);
  t.end();
});

test('server.docs.methods() returns list of methods', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  server.method('topLevel', () => { 'hi there'; });
  server.method('sum', () => { 'hi there'; }, { cache: { expiresIn: 2000, generateTimeout: 100 } });
  const methods = server.docs.methods();
  t.match(methods, [{ name: 'sum', cacheEnabled: true }, { name: 'topLevel' }]);
  t.end();
});

test('also provides list of all the registered event strategies', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  const foo1 = () => {};
  const foo2 = () => {};
  server.events.on('log', foo1);
  server.events.on('log', foo2);
  server.events.on('route', foo2);
  server.events.on('response', () => {});
  const events = server.docs.events();
  t.match(events, {
    log: { handlers: ['foo1', 'foo2'] },
    request: { handlers: ['debug'] },
    response: { handlers: ['(anonymous)'] },
    route: { handlers: ['foo2'] }
  });
});

test('also provides list of all the auth strategies', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  server.auth.scheme('theDefaultScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('default', 'theDefaultScheme');
  server.auth.default('default');
  server.auth.scheme('theLocalScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('local', 'theLocalScheme');
  server.route({
    method: 'POST',
    path: '/appian',
    config: {
      auth: 'local'
    },
    handler(request, h) {
      return 'of the jedi';
    }
  });
  server.route({
    method: 'POST',
    path: '/silkroad',
    config: {
      auth: 'local'
    },
    handler(request, h) {
      return 'to the planet of the apes';
    }
  });
  server.route({
    method: 'GET',
    path: '/appian',
    config: {
      validate: {
        query: {
          name: Joi.string(),
          hash: Joi.string(),
          id: Joi.string()
        }
      }
    },
    handler(request, h) {
      return 'of the king';
    }
  });
  const routes = server.docs.routes();
  const result = server.docs.auth(routes);
  t.match(result, [{ name: 'local' }, { name: 'default' }]);
  t.end();
});

test('server.docs.html() returns html table of both routes and methods', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  const topLevel = () => { 'hi there'; };
  topLevel.description = 'a method';
  topLevel.schema = Joi.object({
    param1: Joi.string().required()
  });
  server.method('topLevel', topLevel);
  server.method('sum', () => { 'hi there'; }, { cache: { expiresIn: 2000, generateTimeout: 100 } });
  server.auth.scheme('theDefaultScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('default', 'theDefaultScheme');
  server.auth.default('default');
  server.auth.scheme('theLocalScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('local', 'theLocalScheme');
  server.route({
    method: 'POST',
    path: '/appian',
    config: {
      auth: 'local',
      validate: {
        query: {
          tag: Joi.string().required()
        },
        payload: {
          name: Joi.string().required(),
          hash: Joi.string().required(),
          id: Joi.string().required()
        }
      }
    },
    handler(request, h) {
      return 'of the king';
    }
  });
  server.route({
    method: 'GET',
    path: '/khyber',
    config: {
      tags: ['secure'],
      notes: 'connects Pakistan and Afghanistan'
    },
    handler(request, h) {
      return 'of the jedi';
    }
  });
  const foo1 = () => {};
  const foo2 = () => {};
  server.events.on('log', foo1);
  server.events.on('log', foo2);
  server.events.on('route', foo2);
  server.events.on('response', () => {});
  const html = server.docs.html();
  t.match(html, fs.readFileSync(path.join(__dirname, 'tableA.html'), 'utf-8'));
  t.end();
});

test('options.docsEndpoint will create an endpoint for accessing server.docs.html()', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {
      docsEndpoint: '/docsEndpoint'
    }
  });
  const topLevel = () => { 'hi there'; };
  topLevel.description = 'a method';
  topLevel.schema = Joi.object({
    param1: Joi.string().required()
  });
  server.method('topLevel', topLevel);
  server.method('sum', () => { 'hi there'; }, { cache: { expiresIn: 2000, generateTimeout: 100 } });
  server.auth.scheme('theDefaultScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('default', 'theDefaultScheme');
  server.auth.default('default');
  server.auth.scheme('theLocalScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('local', 'theLocalScheme');
  server.route({
    method: 'POST',
    path: '/appian',
    config: {
      auth: 'local',
      validate: {
        query: {
          tag: Joi.string().required()
        },
        payload: {
          name: Joi.string().required(),
          hash: Joi.string().required(),
          id: Joi.string().required()
        }
      }
    },
    handler(request, h) {
      return 'of the jedi';
    }
  });
  server.route({
    method: 'GET',
    path: '/khyber',
    config: {
      tags: ['secure'],
      notes: 'connects Pakistan and Afghanistan'
    },
    handler(request, h) {
      return 'of the jedi';
    }
  });
  const foo1 = () => {};
  const foo2 = () => {};
  server.events.on('log', foo1);
  server.events.on('log', foo2);
  server.events.on('route', foo2);
  server.events.on('response', () => {});
  const html = await server.inject({ method: 'get', url: '/docsEndpoint' });
  t.match(html.result, fs.readFileSync(path.join(__dirname, 'table.html'), 'utf-8'));
  t.end();
});

test('will config endpoint if docsEndpointConfig is provided', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  server.auth.scheme('theLocalScheme', () => ({
    authenticate(request, h) {
      throw boom.unauthorized();
    }
  }));
  server.auth.strategy('local', 'theLocalScheme');
  await server.register({
    plugin: require('../'),
    options: {
      docsEndpoint: '/docsEndpoint',
      docsEndpointConfig: {
        auth: 'local'
      }
    }
  });
  server.route({
    method: 'POST',
    path: '/appian',
    handler(request, h) {
      return request.auth;
    }
  });
  const response = await server.inject({ method: 'get', url: '/docsEndpoint' });
  t.equal(response.statusCode, 401, 'strategy blocks access');
  t.end();
});

test('html endpoint can also filter by tag', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {
      docsEndpoint: '/docsEndpoint'
    }
  });
  const topLevel = () => { 'hi there'; };
  topLevel.description = 'a method';
  server.method('topLevel', topLevel);
  server.method('sum', () => { 'hi there'; }, { cache: { expiresIn: 2000, generateTimeout: 100 } });
  server.route({
    method: 'POST',
    path: '/appian',
    config: {
      validate: {
        payload: {
          name: Joi.string().required(),
          hash: Joi.string().required(),
          id: Joi.string().required()
        }
      }
    },
    handler(request, h) {
      return 'of the jedi';
    }
  });
  server.route({
    method: 'GET',
    path: '/khyber',
    config: {
      tags: ['secure'],
      notes: 'connects Pakistan and Afghanistan'
    },
    handler(request, h) {
      return 'of the jedi';
    }
  });
  const html = await server.inject({ method: 'get', url: '/docsEndpoint?tags=secure,blah' });
  t.match(html.result, fs.readFileSync(path.join(__dirname, 'table2.html'), 'utf-8'));
  t.end();
});

test('server.docs.html() will sort routes and methods', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  await server.register({
    plugin: require('../'),
    options: {}
  });
  const topLevel = () => { 'hi there'; };
  server.method('atopLevel', topLevel);
  server.method('topLevel', topLevel);
  server.method('btopLevel', topLevel);
  server.method('sum', () => { 'hi there'; }, { cache: { expiresIn: 2000, generateTimeout: 100 } });
  server.route({
    method: 'GET',
    path: '/camino',
    handler(request, h) {
      return 'of the jedi';
    }
  });
  server.route({
    method: 'POST',
    path: '/appian',
    handler(request, h) {
      return 'of the king';
    }
  });
  server.route({
    method: 'POST',
    path: '/bappian',
    handler(request, h) {
      return 'of the king';
    }
  });
  server.route({
    method: 'GET',
    path: '/Acamino',
    handler(request, h) {
      return 'of the jedi';
    }
  });
  server.route({
    method: 'GET',
    path: '/khyber',
    handler(request, h) {
      return 'of the jedi';
    }
  });
  server.route({
    method: 'GET',
    path: '/gkhyber',
    handler(request, h) {
      return 'of the jedi';
    }
  });
  const html = server.docs.html();
  t.match(html, fs.readFileSync(path.join(__dirname, 'sortedTable.html'), 'utf-8'));
  t.end();
});

test('augment info with getMeta object if provided', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  server.auth.scheme('theDefaultScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('default', 'theDefaultScheme');
  server.auth.default('default');
  server.auth.scheme('theLocalScheme', () => ({
    authenticate(request, h) {
      return h.authenticated({ credentials: { user: 'tron' } });
    }
  }));
  server.auth.strategy('local', 'theLocalScheme');
  server.method('api.create', () => {});
  server.route({
    path: '/some/{name}/page',
    method: 'get',
    handler(request, h) {
      return 'return';
    }
  });
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
  const foo1 = () => {};
  const foo2 = () => {};
  server.events.on('log', foo1);
  server.events.on('log', foo2);
  server.events.on('route', foo2);
  server.events.on('response', () => {});
  const events = server.docs.events();
  const routes = server.docs.routes();
  const auth = server.docs.auth(routes);
  const methods = server.docs.methods();
  t.match(events, {
    log: { handlers: ['foo1', 'foo2'] },
    request: { handlers: ['debug'] },
    response: { handlers: ['(anonymous)'], description: 'triggered when a route responds to a request' },
    route: { handlers: ['foo2'] }
  });
  t.match(auth, [{ name: 'default', description: 'nobody gets in' }]);
  t.match(methods, [{
    name: 'api.create',
    description: 'a meta description',
    tags: ['meta']
  }]);
  t.match(routes, [{
    path: '/some/{name}/page',
    method: 'get',
    description: 'really this is a good route',
    tags: ['meta']
  }]);
});

test('getMeta can also be a function that returns an object', async (t) => {
  const server = new Hapi.Server({
    debug: {
      request: ['error']
    },
    port: 8080
  });
  server.events.on('response', () => {});
  await server.register({
    plugin: require('../'),
    options: {
      getMeta() {
        return {
          events: {
            response: {
              description: 'triggered when a route responds to a request'
            }
          }
        };
      }
    }
  });
  const events = server.docs.events();
  t.match(events, {
    response: { handlers: ['(anonymous)'], description: 'triggered when a route responds to a request' },
  });
});
