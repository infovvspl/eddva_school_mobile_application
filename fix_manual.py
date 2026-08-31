import re

def fix(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Clean up everything to just a clean export function
    # Match export function Foo(props) { ... }
    
    if 'AssignmentsScreen' in filepath:
        content = re.sub(r'export function AssignmentsScreen\(\{\s*theme\s*\}\s*:\s*\{[^}]*\}\s*\)\s*\{', r'export function AssignmentsScreen() {', content)
        content = re.sub(r'const \{ theme \} = useAppTheme\(\);\s*', '', content)
        content = re.sub(r'const \{ theme, isDarkMode, toggleTheme \} = useAppTheme\(\);\s*', r'const { theme } = useAppTheme();\n', content)
    
    if 'SplashScreen' in filepath:
        content = re.sub(r'export function SplashScreen\(\{\s*theme,\s*onFinish,\s*\}\s*:\s*\{[^}]*\}\s*\)\s*\{', r'export function SplashScreen({ onFinish }: { onFinish: () => void }) {', content)
        content = re.sub(r'const \{ theme \} = useAppTheme\(\);\s*', '', content)
        content = re.sub(r'const \{ theme, isDarkMode, toggleTheme \} = useAppTheme\(\);\s*', r'const { theme } = useAppTheme();\n', content)
        
    if 'NotificationsScreen' in filepath:
        content = re.sub(r'export function NotificationsScreen\(\)\s*\{', r'export function NotificationsScreen() {\n  const { theme } = useAppTheme();', content)
        
    if 'StudyPlanScreen' in filepath:
        content = re.sub(r'export function StudyPlanScreen\(\{ onNavigate \}: any\)\s*\{', r'export function StudyPlanScreen({ onNavigate }: any) {\n  const { theme } = useAppTheme();', content)

    # Some remaining duplicate consts might exist, let's just make sure
    content = re.sub(r'(const \{ theme \} = useAppTheme\(\);\s*){2,}', r'\1', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


fix('src/screens/AssignmentsScreen.tsx')
fix('src/screens/SplashScreen.tsx')
fix('src/screens/NotificationsScreen.tsx')
fix('src/screens/StudyPlanScreen.tsx')

print("Done manual regex fixes")
