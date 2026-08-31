import re

filepath = 'src/utils/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Append to the bottom of the object export
additions = """
  // Aliases for missing AI APIs
  generateAiQuiz: (topicId: string) => fetchApi('/school/topics/' + topicId + '/ai-quiz/generate', { method: 'POST' }),
  getToday: () => fetchApi('/school/study-plans/today'),
  generate: (data: any) => fetchApi('/school/study-plans/generate', { method: 'POST', body: JSON.stringify(data) }),
  completeItem: (id: string) => fetchApi('/school/study-plans/items/' + id + '/complete', { method: 'PATCH' }),
  skipItem: (id: string) => fetchApi('/school/study-plans/items/' + id + '/skip', { method: 'PATCH' }),
  quizRushLeaderboard: () => fetchApi('/school/gamification/quiz-rush/leaderboard'),
};
"""

content = re.sub(r'};\s*$', additions, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added missing APIs to api.ts")
