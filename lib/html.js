
module.exports = (methods, routes, auth, events, options) => {
  // use a joiDescribe function if specified:
  const joiFormatter = options.joiDescribe ? options.joiDescribe : joi => JSON.stringify(joi);
  const renderSchemaHeaders = options.renderSchema ? () => `
  <th>Payload Schema</th>
  <th>Query Schema</th>`
    : () => '';
  const renderSchema = options.renderSchema ? r => `
    <td>${r.payload ? joiFormatter(r.payload) : ''}</td>
    <td>${r.query ? joiFormatter(r.query) : ''}</td>`
    : () => '';
  const tagLister = (tagName) => {
    if (options.docsEndpoint) {
      return `<a href="?tags=${tagName}">${tagName}</a>`;
    }
    return tagName;
  };
  const menu = '<div style="float: right"><a href="#routes">Routes</a> | <a href="#methods">Methods</a> | <a href="#events">Events</a> | <a href="#strategies">Strategies</a></div>';
  const html = `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
      }
      td, th {
        padding: 5px;
      }
      tr:nth-child(even) {
        background-color: #f2f2f2
      }
    </style>
    ${menu}
    hapi-docs v${require('../package.json').version}
    <h1 id="routes">Routes</h1>
    <table>
      <tr>
        <th>Path</th>
        <th>Method</th>
        <th>Description</th>
        <th>Auth</th>
        <th>Tags</th>${renderSchemaHeaders()}
      </tr>
      ${routes.map(r => `
        <tr>
          <td>${r.method === 'get' ? `<a href="${r.path}">${r.path}</a>` : r.path}</td>
          <td>${r.method}</td>
          <td>${r.notes || ''}</td>
          <td>${r.auth ? `<b>mode:</b>${r.auth.mode} <b>strategies:</b>${r.auth.strategies}` : ''}</td>
          <td>${r.tags ? r.tags.map(tagLister).join(' , ') : ''}</td>${renderSchema(r)}
      `).join('')}
      <tr>
    </table>
    ${menu}
    <h1 id="methods">Methods</h1>
    <table>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Schema</th>
      </tr>
      ${methods.map(r => `
        <tr>
          <td>${r.name}</td>
          <td>${r.description || ''}</td>
          <td>${r.schema ? joiFormatter(r.schema) : ''}</td>
      `).join('')}
      <tr>
    </table>
    ${menu}
    <h1 id="events">Registered Events</h1>
    <table>
      <tr>
        <th>Event Name</th>
      </tr>
      ${Object.keys(events).map(r => `
        <tr>
          <td>${r}</td>
      `).join('')}
    </table>
    ${menu}
    <h1 id="strategies">Registered Strategies</h1>
    <table>
      <tr>
        <th>Strategy Name</th>
      </tr>
      ${auth.map(r => `
        <tr>
          <td>${r}</td>
      `).join('')}
    </table>

`;
  return html;
};
