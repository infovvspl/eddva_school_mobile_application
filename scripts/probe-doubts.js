const https = require('https');

https.get('https://api.eddva.in/docs-json', r => {
  let b = '';
  r.on('data', c => (b += c));
  r.on('end', () => {
    const s = JSON.stringify(JSON.parse(b));
    const terms = [
      'aiAnswer',
      'aiExplanation',
      'shortExplanation',
      'detailedExplanation',
      'briefAnswer',
      'teacherResponse',
      'questionText',
      'aiResponse',
    ];
    for (const t of terms) {
      const needle = `"${t}"`;
      let idx = 0;
      let count = 0;
      while ((idx = s.indexOf(needle, idx)) >= 0 && count < 2) {
        console.log('\n--', t, '--');
        console.log(s.slice(Math.max(0, idx - 60), idx + 180));
        idx += needle.length;
        count++;
      }
    }
  });
});
