const fs = require('fs');
const glob = require('glob');

glob('src/screens/*.tsx', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Restore the missing theme destructuring
    content = content.replace(/const { isDarkMode, toggleTheme } = useAppTheme\(\);/g, 'const { theme, isDarkMode, toggleTheme } = useAppTheme();');
    
    // Fix weird syntax in SplashScreen and OnboardingScreen
    content = content.replace(/}: {\s*};\s*onFinish: \(\) => void;\s*}/g, '}: { onFinish: () => void; }');
    content = content.replace(/}: {\s*};\s*onContinue: \(\) => void;\s*}/g, '}: { onContinue: () => void; }');
    
    fs.writeFileSync(file, content, 'utf8');
  });
  console.log("Fixed theme hook!");
});
