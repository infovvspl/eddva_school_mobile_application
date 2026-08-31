const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { from: /#4F46E5/g, to: '#2563EB' },
  { from: /#1E1B4B/g, to: '#1E3A8A' },
  { from: /#EEF2FF/g, to: '#DBEAFE' },
  { from: /#E0E7FF/g, to: '#BFDBFE' },
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const r of replacements) {
    content = content.replace(r.from, r.to);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Reverted colors in', file);
  }
}
