import re
import os

def fix_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix "Duplicate identifier 'theme'"
    # If there are multiple `const { theme` or similar, we replace them.
    # We will just find all `const { theme } = useAppTheme();` and ensure there is only one.
    if "const { theme } = useAppTheme();" in content:
        # replace all, then add it back once
        content = content.replace("const { theme } = useAppTheme();", "")
        # Add it back right inside the main component function
        content = re.sub(r'(export function .*?\{.*?\}\) \{)', r"\1\n  const { theme } = useAppTheme();", content, count=1, flags=re.DOTALL)
        
    # 2. Fix "Cannot find name 'theme'"
    # If `useAppTheme()` is called but `theme` is missing from destructuring
    content = re.sub(r'const\s*\{\s*isDarkMode\s*,\s*toggleTheme\s*\}\s*=\s*useAppTheme\(\);', r'const { theme, isDarkMode, toggleTheme } = useAppTheme();', content)
    
    # 3. If `theme` is still completely missing but `useAppTheme` is imported
    if 'useAppTheme' in content and 'const { theme' not in content and 'const {theme' not in content:
        content = re.sub(r'(export function .*?\{.*?\}\) \{)', r"\1\n  const { theme } = useAppTheme();", content, count=1, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

files = [
    'src/screens/TimetableScreen.tsx',
    'src/screens/StudyPlanScreen.tsx',
    'src/screens/NotificationsScreen.tsx',
    'src/screens/AssignmentsScreen.tsx',
    'src/screens/SplashScreen.tsx'
]

for f in files:
    fix_file(f)

print("Fixed TS files")
