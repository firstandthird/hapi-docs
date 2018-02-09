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
  await server.start();
  const response = await server.inject({ url: '/docs' });
  t.deepEqual(response.result[0], {
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
  }, 'handles simple routes');

  t.deepEqual(response.result[1], {
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
  }, 'handles POST and query payload');

  t.deepEqual(response.result[2], {
    path: '/docs',
    method: 'get'
  }, 'returns the docs route as well');

  t.deepEqual(response.result[3], {
    path: '/khyber',
    method: 'get',
    tags: ['secure'],
    notes: 'connects Pakistan and Afghanistan'
  }, 'returns the notes and tags for the route');
  await server.stop();
  t.end();
});

test('the "tags" query option will only return routes with the specified tag', async (t) => {
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
  await server.start();
  const response = await server.inject({ url: '/docs?tags=secure,api' });
  t.deepEqual(response.result, [{
    path: '/appian',
    method: 'get',
    tags: ['secure'],
  }, {
    path: '/appian',
    method: 'post',
    tags: ['secure'],
  }, {
    path: '/camino',
    method: 'post',
    tags: ['api'],
  }], 'only returns info for routes matching the specified tags');
  await server.stop();
  t.end();
});
