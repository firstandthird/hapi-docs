const joi = require('joi');
const defaults = {
  docsPath: '/docs'
};

const register = function(server, pluginOptions = {}) {
  const options = Object.assign({}, defaults, pluginOptions);
  const documentRoutes = (query) => server.table().reduce((memo, route) => {
    if (query.tags && query.tags.split(',').every((tag) => !route.settings.tags || !route.settings.tags.includes(tag))) {
      return memo;
    }
    const routeInfo = {
      path: route.path,
      method: route.method
    };
    if (route.settings.auth) {
      routeInfo.auth = route.settings.auth;
    }
    if (route.settings.tags) {
      routeInfo.tags = route.settings.tags;
    }
    if (route.settings.notes) {
      routeInfo.notes = route.settings.notes;
    }
    if (route.settings.validate) {
      if (route.settings.validate.payload) {
        routeInfo.payload = joi.describe(route.settings.validate.payload);
      }
      if (route.settings.validate.query) {
        routeInfo.query = joi.describe(route.settings.validate.query);
      }
    }
    memo.push(routeInfo);
    return memo;
  }, []).sort((a, b) => a.path > b.path);
  server.route({ method: 'get', path: options.docsPath, handler: (request, h) => documentRoutes(request.query) });
};

exports.plugin = {
  once: true,
  pkg: require('./package.json'),
  register
};
