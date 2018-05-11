const registerAll = require('./lib/methods');
const routes = require('./lib/routes');

const register = function(server, pluginOptions = {}) {
  server.decorate('server', 'docs', {
    methods() {
      const allMethods = [];
      registerAll(allMethods, server.methods);
      return allMethods;
    },
    routes(options) { return routes(server, Object.assign({}, pluginOptions, options)); }
  });
};

exports.plugin = {
  once: true,
  pkg: require('./package.json'),
  register
};
