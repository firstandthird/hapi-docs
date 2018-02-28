const joi = require('joi');
const defaults = {
  docsPath: '/docs',
  auth: null
};

const register = function(server, pluginOptions = {}) {
  const options = Object.assign({}, defaults, pluginOptions);
  server.route({
    method: 'get',
    path: `${options.docsPath}.json`,
    config: {
      auth: options.auth
    },
    handler(request, h) {
      const unsortedRoutes = server.table().reduce((memo, route) => {
        // '?tags=tag1,tag21' will only look at routes that are tagged as tag1 or tag2:
        if (request.query.tags && request.query.tags.split(',').every((tag) => !route.settings.tags || !route.settings.tags.includes(tag))) {
          return memo;
        }
        // all routes have path and method:
        const routeInfo = {
          path: route.path,
          method: route.method
        };
        // some other additional info that routes may or may not have:
        // if there is a global auth then all routes by default use it:
        if (server.auth.settings.default) {
          routeInfo.auth = server.auth.settings.default;
        }
        // if there is a locally-configed auth show both local and overridden auth:
        if (route.settings.auth) {
          if (routeInfo.auth) {
            routeInfo.overriddenAuth = routeInfo.auth;
          }
          routeInfo.auth = route.settings.auth;
        }
        if (route.settings.tags) {
          routeInfo.tags = route.settings.tags;
        }
        if (route.settings.notes) {
          routeInfo.notes = route.settings.notes;
        }
        const routePluginInfo = route.settings.plugins['hapi-api-docs'] || {};
        // if you need to manually validate inside the code of the route handler,
        // you can still describe a validation schema for hapi-api-docs. Otherwise
        // it will just try to include the one specified in config.validate:
        const validationSpecs = routePluginInfo.validate || route.settings.validate;
        // validation specs will be returned for payload and query:
        if (validationSpecs) {
          if (validationSpecs.payload) {
            routeInfo.payload = joi.describe(validationSpecs.payload);
          }
          if (validationSpecs.query) {
            routeInfo.query = joi.describe(validationSpecs.query);
          }
        }
        memo.push(routeInfo);
        return memo;
      }, []);
      // routes will be sorted alphabetically
      return unsortedRoutes.sort((a, b) => a.path > b.path);
    }
  });
};

exports.plugin = {
  once: true,
  pkg: require('./package.json'),
  register
};
