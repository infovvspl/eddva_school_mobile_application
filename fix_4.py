import os
import re

files_to_fix = [
    'src/screens/SplashScreen.tsx',
    'src/screens/OnboardingScreen.tsx',
    'src/screens/LoginScreen.tsx',
    'src/screens/TimetableScreen.tsx'
]

for filepath in files_to_fix:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add import
    if 'useAppTheme' not in content:
        imports_end = [m.end() for m in re.finditer(r"^import .*;$", content, re.MULTILINE)]
        if imports_end:
            insert_pos = imports_end[-1]
        else:
            insert_pos = 0
        content = content[:insert_pos] + "\nimport { useAppTheme } from '../context/ThemeContext';" + content[insert_pos:]

    # 2. Add hook (find function body start by looking for '}) {' or ') {')
    # Actually, let's just find the first instance of '  const ' or '  const [' or '  useEffect' inside the function
    # or just use a specific string replacement for each file
    if 'SplashScreen' in filepath:
        content = content.replace("export function SplashScreen({\n  onFinish,\n  theme,\n}: {\n  onFinish: () => void;\n  theme: any;\n}) {", "export function SplashScreen({ onFinish }: { onFinish: () => void; }) {\n  const { theme, isDarkMode, toggleTheme } = useAppTheme();\n  const styles = getStyles(theme);")
    elif 'OnboardingScreen' in filepath:
        content = content.replace("export function OnboardingScreen({\n  onContinue,\n  theme,\n}: {\n  onContinue: () => void;\n  theme: any;\n}) {", "export function OnboardingScreen({ onContinue }: { onContinue: () => void; }) {\n  const { theme, isDarkMode, toggleTheme } = useAppTheme();\n  const styles = getStyles(theme);")
    elif 'LoginScreen' in filepath:
        content = content.replace("export function LoginScreen({\n  onLogin,\n  theme,\n}: {\n  onLogin: () => void;\n  theme: { background: string; surface: string; text: string; subtext: string; primary: string; primarySoft: string; border: string; accent: string };\n}) {", "export function LoginScreen({ onLogin }: { onLogin: () => void; }) {\n  const { theme, isDarkMode, toggleTheme } = useAppTheme();\n  const styles = getStyles(theme);")
        # Also fix SwipeButton
        content = content.replace("const SwipeButton = ({ onSwipeComplete, isLoading }: { onSwipeComplete: () => void, isLoading: boolean }) => {\n  const pan = useRef", "const SwipeButton = ({ onSwipeComplete, isLoading }: { onSwipeComplete: () => void, isLoading: boolean }) => {\n  const { theme } = useAppTheme();\n  const styles = getStyles(theme);\n  const pan = useRef")
    elif 'TimetableScreen' in filepath:
        content = content.replace("export function TimetableScreen({ theme }: any) {", "export function TimetableScreen() {\n  const { theme, isDarkMode, toggleTheme } = useAppTheme();\n  const styles = getStyles(theme);")
        
    # 3. Replace styles
    content = content.replace("const styles = StyleSheet.create({", "const getStyles = (theme: any) => StyleSheet.create({")

    # 4. Replace colors
    replacements = [
        (r"'#FFFFFF'", "theme.surface"),
        (r"'#FFF'", "theme.surface"),
        (r"'#F8FAFC'", "theme.background"),
        (r"'#F1F5F9'", "theme.surfaceAlt"),
        (r"'#1E3A8A'", "theme.headerBg"),
        (r"'#0F172A'", "theme.text"),
        (r"'#111827'", "theme.text"),
        (r"'#1E293B'", "theme.text"),
        (r"'#334155'", "theme.text"),
        (r"'#64748B'", "theme.subtext"),
        (r"'#475569'", "theme.subtext"),
        (r"'#94A3B8'", "theme.subtext"),
        (r"'#E2E8F0'", "theme.border"),
        (r"'#CBD5E1'", "theme.border"),
        (r"'#2563EB'", "theme.primary"),
        (r"'#3B82F6'", "theme.primary"),
    ]
    for old, new in replacements:
        content = re.sub(old, new, content, flags=re.IGNORECASE)

    # 5. Icons
    def icon_color_replacer(m):
        color_val = m.group(1).upper()
        if color_val in ['#475569', '#94A3B8', '#CBD5E1', '#64748B']:
            return "color={theme.subtext}"
        elif color_val in ['#0F172A', '#111827', '#1E293B', '#334155']:
            return "color={theme.text}"
        elif color_val in ['#2563EB', '#3B82F6']:
            return "color={theme.primary}"
        elif color_val in ['#FFF', '#FFFFFF']:
            return "color={theme.surface}"
        return m.group(0)

    content = re.sub(r'color="(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))"', icon_color_replacer, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed!")
