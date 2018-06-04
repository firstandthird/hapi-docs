const joi = require('joi');

const registerAll = (current, subObj, subObjName) => {
  Object.keys(subObj).forEach(methodName => {
    const method = subObj[methodName];
    if (subObjName) {
      methodName = `${subObjName}.${methodName}`;
    }
    if (typeof method === 'function') {
      const methodDescription = { name: methodName };
      if (method.description) {
        methodDescription.description = method.description;
      }
      if (method.schema) {
        methodDescription.schema = joi.describe(method.schema);
      }
      if (method.cache) {
        methodDescription.cacheEnabled = true;
      }
      return current.push(methodDescription);
    }
    if (typeof method === 'object') {
      // otherwise method is an object:
      registerAll(current, method, methodName);
    }
  });
  return current.sort((a, b) => a.name.toLowerCase().toLowerCase().localeCompare(b.name.toLowerCase()));
};

module.exports = registerAll;
