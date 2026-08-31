const fs = require('fs');
const glob = require('glob');

glob('src/screens/*.tsx', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove `theme,` or `theme` from props destructuring
    content = content.replace(/{\s*theme\s*,/g, '{');
    content = content.replace(/,\s*theme\s*}/g, '}');
    content = content.replace(/{\s*theme\s*}/g, '{}');
    content = content.replace(/theme\s*:\s*[^,}]*[,]?/g, ''); // type definitions
    content = content.replace(/theme,\n/g, '');
    
    // Fix duplicate theme issue in case the python script inserted it and there was already a theme variable
    // Wait, let's just write the content
    fs.writeFileSync(file, content, 'utf8');
  });
  console.log("Removed theme props!");
});
