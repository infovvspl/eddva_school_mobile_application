const fs = require('fs');
let txt = fs.readFileSync('temp_DashboardScreen.txt', 'utf8').trim();
if (txt.startsWith('"') && txt.endsWith('"')) {
    txt = txt.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
    fs.writeFileSync('src/screens/DashboardScreen.tsx', txt);
    console.log('Fixed');
} else {
    console.log('Not a string literal');
}
