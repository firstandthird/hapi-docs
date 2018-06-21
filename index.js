const registerAll = require('./lib/methods');
const routes = require('./lib/routes');
const html = require('./lib/html');

const register = function(server, pluginOptions = {}) {
  let meta = {};
  // getMeta will be either an object or a function that returns an object
  if (pluginOptions.getMeta) {
    meta = typeof pluginOptions.getMeta === 'function' ? pluginOptions.getMeta() : pluginOptions.getMeta;
  }
  server.decorate('server', 'docs', {
    events() {
      return Object.keys(server.events._eventListeners).reduce((memo, key) => {
        const listener = server.events._eventListeners[key];
        if (listener.handlers) {
          memo[key] = { handlers: [] };
          listener.handlers.forEach(handler => {
            memo[key].handlers.push(handler.listener.name || '(anonymous)');
          });
          if (meta.events && meta.events[key]) {
            Object.assign(memo[key], meta.events[key]);
          }
        }
        return memo;
      }, {});
    },
    auth(routeList) {
      return routeList.reduce((memo, item) => {
        if (item.auth && item.auth.strategies) {
          item.auth.strategies.forEach(strat => {
            if (!memo.includes(strat)) {
              const data = { name: strat };
              if (meta.strategies && meta.strategies[strat]) {
                Object.assign(data, meta.strategies[strat]);
              }
              memo.push(data);
            }
          });
        }
        return memo;
      }, []);
    },
    methods() {
      const allMethods = [];
      registerAll(allMethods, server.methods);
      allMethods.forEach(method => {
        if (meta.methods && meta.methods[method.name]) {
          Object.assign(method, meta.methods[method.name]);
        }
      });
      return allMethods;
    },
    routes(options) { return routes(server, Object.assign({}, pluginOptions, options), meta); },
    html(options = {}) {
      const routeList = server.docs.routes(options);
      return html(server.docs.methods(), routeList, server.docs.auth(routeList), server.docs.events(), pluginOptions);
    }
  });
  if (pluginOptions.docsEndpoint) {
    const routeConfig = {
      method: 'get',
      path: pluginOptions.docsEndpoint,
      handler(request, h) {
        const options = request.query.tags ? { tags: request.query.tags } : {};
        return server.docs.html(options);
      }
    };
    if (pluginOptions.docsEndpointConfig) {
      routeConfig.config = pluginOptions.docsEndpointConfig;
    }
    server.route(routeConfig);
  }
};

exports.plugin = {
  once: true,
  pkg: require('./package.json'),
  register
};
