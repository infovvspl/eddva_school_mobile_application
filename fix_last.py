import re
with open('src/screens/AssignmentsScreen.tsx', 'r') as f:
    content = f.read()

content = content.replace("'Pending'", "'pending'")
content = content.replace("Due: {item.dueDate}", "Status: {item.status}")

with open('src/screens/AssignmentsScreen.tsx', 'w') as f:
    f.write(content)

with open('src/screens/StudyPlanScreen.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'const \{ theme \} = useAppTheme\(\);\n', '', content)
content = re.sub(r'export function StudyPlanScreen\(\{ onNavigate \}: any\) \{', 'export function StudyPlanScreen({ onNavigate }: any) {\n  const { theme } = useAppTheme();', content)

# just in case there are still multiple const { theme }
parts = content.split('const { theme } = useAppTheme();')
if len(parts) > 2:
    content = parts[0] + 'const { theme } = useAppTheme();' + ''.join(parts[1:])

with open('src/screens/StudyPlanScreen.tsx', 'w') as f:
    f.write(content)
