import os

# Update App.tsx
app_path = 'App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

import_statement = "import { RecordedClassesScreen } from './src/screens/RecordedClassesScreen';"
if import_statement not in app_content:
    app_content = app_content.replace(
        "import { GamificationScreen } from './src/screens/GamificationScreen';",
        f"import {{ GamificationScreen }} from './src/screens/GamificationScreen';\n{import_statement}"
    )

if "| 'recordedClasses'" not in app_content:
    app_content = app_content.replace(
        "| 'askDoubt';",
        "| 'askDoubt'\n  | 'recordedClasses';"
    )

if "case 'recordedClasses':" not in app_content:
    app_content = app_content.replace(
        "case 'gamification':",
        "case 'recordedClasses':\n        return <RecordedClassesScreen onNavigate={(tab: any) => setScreen(tab)} />;\n      case 'gamification':"
    )

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

# Update LearnScreen.tsx
learn_path = 'src/screens/LearnScreen.tsx'
with open(learn_path, 'r', encoding='utf-8') as f:
    learn_content = f.read()

# Replace any blank onSeeAll with navigation
if "renderSectionHeader('Recordings', () => {})" in learn_content:
    learn_content = learn_content.replace(
        "renderSectionHeader('Recordings', () => {})",
        "renderSectionHeader('Recordings', () => onNavigate && onNavigate('recordedClasses'))"
    )
elif "renderSectionHeader('Recordings')" in learn_content:
    learn_content = learn_content.replace(
        "renderSectionHeader('Recordings')",
        "renderSectionHeader('Recordings', () => onNavigate && onNavigate('recordedClasses'))"
    )

with open(learn_path, 'w', encoding='utf-8') as f:
    f.write(learn_content)

print("App.tsx and LearnScreen.tsx updated successfully")
