import re

files_to_fix = [
    'src/screens/GamificationScreen.tsx',
    'src/screens/StudyPlanScreen.tsx'
]

for file_path in files_to_fix:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find schoolApi.something() and if it doesn't end with .catch, add .catch(() => null)
    # This regex is a bit tricky, let's just do a simple replacement for known bad calls:
    
    # StudyPlanScreen
    content = content.replace('schoolApi.getBacklogs(),', 'schoolApi.getBacklogs().catch(() => null),')
    content = content.replace('schoolApi.getStudyPlanWeakTopics(),', 'schoolApi.getStudyPlanWeakTopics().catch(() => null),')
    content = content.replace('schoolApi.getRevision(),', 'schoolApi.getRevision().catch(() => null),')
    content = content.replace('schoolApi.getRoadmap()', 'schoolApi.getRoadmap().catch(() => [])')

    # GamificationScreen
    content = content.replace('schoolApi.startMemoryMatch();', 'schoolApi.startMemoryMatch().catch(() => {});')
    content = content.replace('schoolApi.startQuizRush();', 'schoolApi.startQuizRush().catch(() => {});')
    content = content.replace('schoolApi.startWordMaster();', 'schoolApi.startWordMaster().catch(() => {});')
    content = content.replace('schoolApi.getTreasureMaps();', 'schoolApi.getTreasureMaps().catch(() => {});')
    content = content.replace('schoolApi.startMathSprint();', 'schoolApi.startMathSprint().catch(() => {});')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed API calls in Gamification and StudyPlan screens.")
