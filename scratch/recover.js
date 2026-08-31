const fs = require('fs');

try {
  let data = fs.readFileSync('temp_DashboardScreen.txt', 'utf8');
  // It seems to be a JSON string literal (starting and ending with quotes, with \n escaped)
  if (data.startsWith('"') && data.endsWith('"\n')) {
      data = JSON.parse(data.trim());
  } else if (data.startsWith('"') && data.endsWith('"')) {
      data = JSON.parse(data);
  } else if (data.startsWith('"')) {
      // Sometimes it might not have the exact closing quote at the end due to whitespace
      data = JSON.parse(data.trim());
  }
  
  fs.writeFileSync('src/screens/DashboardScreen.tsx', data);
  console.log('Successfully recovered DashboardScreen.tsx');
} catch(e) {
  console.error('Failed to parse:', e);
}
