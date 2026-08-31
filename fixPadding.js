const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // The previous regex wrapped the dynamic calculation in vs()
  // paddingTop: vs(Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 60)
  // We need to revert it back to not use vs()
  
  content = content.replace(/paddingTop:\s*vs\(Platform\.OS === 'android' \? \(StatusBar\.currentHeight \|\| 24\) \+ 10 : 60\)/g, "paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 60");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed paddingTop in ${file}`);
  }
}
