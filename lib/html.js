module.exports = (methods, routes, auth, events) => {
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
    <h1 id="routes">Routes</h1>
    <table>
      <tr>
        <th>Path</th>
        <th>Method</th>
        <th>Description</th>
        <th>Auth</th>
        <th>Tags</th>
      </tr>
      ${routes.map(r => `
        <tr>
          <td><a href="${r.path}">${r.path}</a></td>
          <td>${r.method}</td>
          <td>${r.notes || ''}</td>
          <td>${r.auth ? JSON.stringify(r.auth, null, 2) : ''}</td>
          <td>${r.tags ? r.tags.join(', ') : ''}</td>
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
          <td>${false && r.schema ? JSON.stringify(r.schema, null, 2) : ''}</td>
      `).join('')}
      <tr>
    </table>
    ${menu}
    <h1 id="events">Registered Events</h1>
    <table>
      <tr>
        <th>Event Name</th>
        <th>Event Handlers</th>
      </tr>
      ${Object.keys(events).map(r => `
        <tr>
          <td>${r}</td>
          <td>${events[r].join(', ')}</td>
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
