const registerAll = require('./lib/methods');
const routes = require('./lib/routes');
const html = require('./lib/html');

const register = function(server, pluginOptions = {}) {
  server.decorate('server', 'docs', {
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
