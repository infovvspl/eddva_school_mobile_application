import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if 'PdfViewerScreen' not in content:
    content = content.replace(
        "import { LiveClassRoomScreen } from './src/screens/LiveClassRoomScreen';",
        "import { LiveClassRoomScreen } from './src/screens/LiveClassRoomScreen';\nimport { PdfViewerScreen } from './src/screens/PdfViewerScreen';\nimport { ExamScreen } from './src/screens/ExamScreen';"
    )

# Add to Screen type
if "'pdfViewer'" not in content:
    content = content.replace(
        "  | 'liveClassRoom';",
        "  | 'liveClassRoom'\n  | 'pdfViewer'\n  | 'exam';"
    )

# Add to switch router in renderScreen
route_cases = """
      case 'pdfViewer':
        return <PdfViewerScreen onNavigate={(tab: any) => setScreen(tab)} routeParams={{ url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'Chapter Notes' }} />;
      case 'exam':
        return <ExamScreen onNavigate={(tab: any) => setScreen(tab)} routeParams={{ title: 'Final Exam: Mathematics' }} />;
"""
if "case 'pdfViewer':" not in content:
    content = content.replace(
        "      case 'liveClassRoom':\n        return <LiveClassRoomScreen onNavigate={(tab: any) => setScreen(tab)} />;",
        "      case 'liveClassRoom':\n        return <LiveClassRoomScreen onNavigate={(tab: any) => setScreen(tab)} />;" + route_cases
    )

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.tsx routing")
