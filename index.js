const registerAll = require('./lib/methods');
const routes = require('./lib/routes');
const html = require('./lib/html');

const register = function(server, pluginOptions = {}) {
  server.decorate('server', 'docs', {
    events() {
      return Object.keys(server.events._eventListeners).reduce((memo, key) => {
        const listener = server.events._eventListeners[key];
        if (listener.handlers) {
          memo[key] = [];
          listener.handlers.forEach(handler => {
            memo[key].push(handler.listener.name || '(anonymous)');
          });
        }
        return memo;
      }, {});
    },
    auth(routeList) {
      return routeList.reduce((memo, item) => {
        if (item.auth && item.auth.strategies) {
          item.auth.strategies.forEach(strat => {
            if (!memo.includes(strat)) {
              memo.push(strat);
            }
          });
        }
        return memo;
      }, []);
    },
    methods() {
      const allMethods = [];
      registerAll(allMethods, server.methods);
      return allMethods;
    },
    routes(options) { return routes(server, Object.assign({}, pluginOptions, options)); },
    html() {
      const routeList = server.docs.routes();
      return html(server.docs.methods(), routeList, server.docs.auth(routeList), server.docs.events());
    }
  });
  if (pluginOptions.docsEndpoint) {
    const routeConfig = {
      method: 'get',
      path: pluginOptions.docsEndpoint,
      handler(request, h) {
        return server.docs.html();
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
