const https = require('https');

https.get('https://api.eddva.in/docs-json', r => {
  let b = '';
  r.on('data', c => (b += c));
  r.on('end', () => {
    const j = JSON.parse(b);
    const schemas = j.components?.schemas || {};
    for (const [name, schema] of Object.entries(schemas)) {
      if (!/lecture/i.test(name)) continue;
      console.log('\n===', name, '===');
      console.log(JSON.stringify(schema.properties || schema, null, 2).slice(0, 2500));
    }
    const paths = j.paths || {};
    for (const p of Object.keys(paths)) {
      if (/content\/lectures/i.test(p)) console.log('PATH', p);
    }
  });
});
