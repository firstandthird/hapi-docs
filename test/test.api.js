const test = require('tap').test;
const Hapi = require('hapi');
const Joi = require('joi');

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
