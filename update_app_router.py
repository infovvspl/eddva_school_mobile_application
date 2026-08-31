import re

filepath = 'App.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_str = "import { LiveClassRoomScreen } from './src/screens/LiveClassRoomScreen';\n"
content = re.sub(r"(import { AiQuizScreen } from '\./src/screens/AiQuizScreen';)", r"\1\n" + import_str, content)

# Add to type Screen
type_str = "  | 'liveClassRoom';"
content = re.sub(r"  \| 'aiQuiz';", r"  | 'aiQuiz'\n" + type_str, content)

# Add to switch
switch_str = "      case 'liveClassRoom':\n        return <LiveClassRoomScreen onNavigate={(tab: any) => setScreen(tab)} routeParams={{ id: 'c69f9e30-23fa-6125-df14-1ae7e90d614e' }} />;"
content = re.sub(r"(      case 'aiQuiz':\n        return <AiQuizScreen onNavigate={\(tab: any\) => setScreen\(tab\)} />;)", r"\1\n" + switch_str, content)

# Hide bottom nav for liveClassRoom
content = re.sub(r"(!\['splash', 'onboarding', 'login', 'menu')", r"\1, 'liveClassRoom'", content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.tsx")
