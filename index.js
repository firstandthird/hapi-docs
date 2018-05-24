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
    html(options = {}) { return html(server.docs.methods(), server.docs.routes(options)); }
  });
  if (pluginOptions.docsEndpoint) {
    server.route({
      method: 'get',
      path: pluginOptions.docsEndpoint,
      handler(request, h) {
        const options = request.query.tags ? { tags: request.query.tags } : {};
        return server.docs.html(options);
      }
    });
  }
};

exports.plugin = {
  once: true,
  pkg: require('./package.json'),
  register
};
