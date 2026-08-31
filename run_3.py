import re

files = [
    'src/screens/DashboardScreen.tsx',
    'src/screens/ProfileScreen.tsx',
    'src/screens/AssignmentsScreen.tsx'
]

for filepath in files:
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
        
    # 2. Inject hook
    def inject_hook(match):
        return match.group(1) + "\n  const { theme, isDarkMode, toggleTheme } = useAppTheme();\n  const styles = getStyles(theme);"
    
    content = re.sub(r'(export\s+(?:default\s+)?(?:function|const)\s+[a-zA-Z0-9_]+\s*(?:=|)\s*\([\s\S]*?\)\s*(?::\s*[^{]*)?(?:=>)?\s*{)', inject_hook, content)
    
    # 3. Replace styles
    content = content.replace("const styles = StyleSheet.create({", "const getStyles = (theme: any) => StyleSheet.create({")
    
    # 4. Remove theme from props
    content = content.replace("({ onNavigate, theme }: any)", "({ onNavigate }: any)")
    
    # 5. Colors
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

print("Done fixing the 3 files!")
