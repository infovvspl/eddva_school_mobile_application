const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const hsProps = ['width', 'minWidth', 'maxWidth', 'paddingHorizontal', 'paddingLeft', 'paddingRight', 'marginHorizontal', 'marginLeft', 'marginRight', 'left', 'right', 'columnGap'];
const vsProps = ['height', 'minHeight', 'maxHeight', 'paddingVertical', 'paddingTop', 'paddingBottom', 'marginVertical', 'marginTop', 'marginBottom', 'top', 'bottom', 'rowGap'];
const msProps = ['fontSize', 'borderRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'padding', 'margin', 'lineHeight', 'shadowRadius', 'gap'];

// Build regexes for each
// e.g. /width:\s*(\d+(\.\d+)?)/g
function createReplacer(props, funcName) {
  const propPattern = props.join('|');
  const regex = new RegExp(`(${propPattern})\\s*:\\s*(-?\\d+(\\.\\d+)?)(?!\\s*[%a-zA-Z])`, 'g');
  return (content) => {
    return content.replace(regex, (match, prop, value) => {
      // Don't wrap 0
      if (parseFloat(value) === 0) return `${prop}: 0`;
      return `${prop}: ${funcName}(${value})`;
    });
  };
}

const applyHs = createReplacer(hsProps, 'hs');
const applyVs = createReplacer(vsProps, 'vs');
const applyMs = createReplacer(msProps, 'ms');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Apply scaling
  content = applyHs(content);
  content = applyVs(content);
  content = applyMs(content);

  // We might also have size={24} for icons. Let's do size={ms(24)}
  content = content.replace(/size=\{(-?\d+(\.\d+)?)\}/g, (match, val) => {
    if (parseFloat(val) === 0) return match;
    return `size={ms(${val})}`;
  });

  if (content !== originalContent) {
    // Add imports for hs, vs, ms
    // Search for existing responsive import
    if (!content.includes('../utils/responsive')) {
      // Add right after react-native import or at the top
      const rnImportRegex = /import\s+.*?from\s+['"]react-native['"];?/;
      const match = content.match(rnImportRegex);
      const importStmt = `\nimport { hs, vs, ms } from '../utils/responsive';`;
      if (match) {
        content = content.replace(rnImportRegex, match[0] + importStmt);
      } else {
        content = `import { hs, vs, ms } from '../utils/responsive';\n` + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${file}`);
  }
}
