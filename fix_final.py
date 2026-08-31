import re

files = [
    'src/screens/SplashScreen.tsx',
    'src/screens/OnboardingScreen.tsx',
    'src/screens/StudyPlanScreen.tsx',
    'src/screens/TimetableScreen.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'useAppTheme' not in content:
        content = "import { useAppTheme } from '../context/ThemeContext';\n" + content
        
    # find the component function body and inject if not there
    if 'getStyles(theme)' not in content:
        def inj(m):
            return m.group(0) + "\n  const { theme, isDarkMode, toggleTheme } = useAppTheme();\n  const styles = getStyles(theme);"
        
        # Matches: export function Name(...) {
        content = re.sub(r'(export\s+(?:default\s+)?(?:function|const)\s+[a-zA-Z0-9_]+\s*(?:=|)\s*\([\s\S]*?\)\s*(?::\s*[^{]*)?(?:=>)?\s*{)', inj, content, count=1)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Final fix done!")
