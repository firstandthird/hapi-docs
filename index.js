const registerAll = require('./lib/methods');
const routes = require('./lib/routes');
const html = require('./lib/html');

const register = function(server, pluginOptions = {}) {
  server.decorate('server', 'docs', {
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
    html() { return html(server.docs.methods(), server.docs.routes()); }
  });
  if (pluginOptions.docsEndpoint) {
    server.route({
      method: 'get',
      path: pluginOptions.docsEndpoint,
      handler(request, h) {
        return server.docs.html();
      }
    });
  }
};

exports.plugin = {
  once: true,
  pkg: require('./package.json'),
  register
};
