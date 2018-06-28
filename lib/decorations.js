module.exports = function(server) {
  const deco = {};
  Object.keys(server._core._decorations).forEach(decorationType => {
    // don't log if nothing set:
    if (!server._core._decorations[decorationType] || Object.keys(server._core._decorations[decorationType]).length === 0) {
      return;
    }
    deco[decorationType] = {};
    Object.keys(server._core._decorations[decorationType]).forEach(decorationName => {
      const decoration = server._core._decorations[decorationType][decorationName];
      switch (typeof decoration) {
        case 'object':
          deco[decorationType][decorationName] = Object.keys(decoration).join(',');
          break;
        case 'function':
          deco[decorationType][decorationName] = decoration.name;
          break;
        default:
          deco[decorationType][decorationName] = decoration;
      }
    });
  });
  return deco;
};
