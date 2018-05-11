const routes = require('./lib/routes');

const register = function(server, pluginOptions = {}) {
  server.decorate('server', 'docs', {
    routes: (options) => routes(server, Object.assign({}, pluginOptions, options))
  });
};

exports.plugin = {
  once: true,
  pkg: require('./package.json'),
  register
};
