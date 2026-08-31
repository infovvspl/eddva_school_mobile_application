const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace paddingTop: 60 with responsive padding
  const newPadding = "paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 60";
  content = content.replace(/paddingTop:\s*60/g, newPadding);
  
  if (content !== originalContent) {
    // Add Platform and StatusBar to react-native imports if not present
    content = content.replace(/import\s+{([\s\S]+?)}\s+from\s+['"]react-native['"]/g, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (!imports.includes('Platform')) imports.push('Platform');
      if (!imports.includes('StatusBar')) imports.push('StatusBar');
      return `import { ${imports.join(', ')} } from 'react-native'`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed padding in', file);
  }
}
