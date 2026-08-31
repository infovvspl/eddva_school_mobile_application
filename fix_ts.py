import re
import glob
import os

screens_dir = 'src/screens'
files_to_fix = [
    'SplashScreen.tsx',
    'OnboardingScreen.tsx',
    'TimetableScreen.tsx',
    'AssignmentsScreen.tsx',
    'NotificationsScreen.tsx',
    'StudyPlanScreen.tsx'
]

for file in files_to_fix:
    path = os.path.join(screens_dir, file)
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove theme from props
    # 1. Match `theme,` in destructured props
    content = re.sub(r'theme,\s*', '', content)
    
    # 2. Match `theme: { ... }` in type definition
    content = re.sub(r'theme:\s*\{[^}]*\};\s*', '', content)
    content = re.sub(r'theme:\s*any;\s*', '', content)
    
    # 3. Add useAppTheme if not present
    if 'useAppTheme' not in content:
        content = re.sub(r"(import React.*?from 'react';)", r"\1\nimport { useAppTheme } from '../context/ThemeContext';", content)
        
    if 'const { theme }' not in content and 'const { theme,' not in content and 'const {theme}' not in content:
        content = re.sub(r'(export function .*?\{.*?\}\) \{)', r"\1\n  const { theme } = useAppTheme();", content, flags=re.DOTALL)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Fix App.tsx missing theme props (since we removed them, App.tsx should not pass them? No, App.tsx is already NOT passing them, which is why it complained! Wait, App.tsx TS error was `Property 'theme' is missing in type... but required in type...`. So App.tsx is fine, the components were requiring it.)

# Fix api.ts duplicate keys
api_path = 'src/utils/api.ts'
if os.path.exists(api_path):
    with open(api_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We know there's a bunch of fetchApi at line 525+ that duplicate names
    # Let's just remove the exact lines if we can, or comment them out
    lines = content.split('\n')
    new_lines = []
    seen_keys = set()
    in_obj = False
    
    for i, line in enumerate(lines):
        # Very simple deduplication for the specific getNotifications etc
        match = re.search(r'^\s*([a-zA-Z0-9_]+)\s*:\s*\(.*?\)\s*=>\s*fetchApi', line)
        if match:
            key = match.group(1)
            if key in seen_keys:
                new_lines.append('// ' + line)
            else:
                seen_keys.add(key)
                new_lines.append(line)
        else:
            new_lines.append(line)
            
    with open(api_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

print("Fixed screens and api.ts")
