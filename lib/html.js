module.exports = (methods, routes) => {
  const menu = '<div style="float: right"><a href="#routes">Routes</a> | <a href="#methods">Methods</a></div>';

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
          <td>${r.path}</td>
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
`;
  return html;
};