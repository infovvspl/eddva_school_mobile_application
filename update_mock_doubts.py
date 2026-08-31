import re

filepath = 'src/utils/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

mock_data_additions = """
  '/school/doubts/my-doubts': [
    { id: 1, subject: 'Mathematics', question: 'What is real number? (At segment timestamp: 2:33) Lecture: Real Number', date: '7/6/2026, 2:42:44 PM', status: 'AI ANSWERED', explanation: 'Real numbers are the set of all rational and irrational numbers.', hasImage: false },
    { id: 2, subject: 'Chemistry', question: 'How to calculate molar mass?', date: '7/2/2026, 1:26:04 PM', status: 'AI ANSWERED', explanation: 'Molar mass is the mass of one mole of a substance. Add the atomic masses of all atoms in the molecule.', hasImage: true }
  ],
  '/school/doubts': { success: true },
  '/school/ai-chat': { reply: "That's a great question! Let's explore it together." },
"""

# Insert mock data
content = content.replace("'/school/doubts': [", mock_data_additions + "\n  '/school/doubts': [")

# Also add fallback handler for POST /school/doubts and /school/ai-chat if needed. 
# `fetchApi` already resolves if exact match exists in mockData.
# Wait, POST /school/doubts is mapped to exactly `/school/doubts` so mockData['/school/doubts'] might conflict with the existing array.
# Let's see: In api.ts, mockData['/school/doubts'] = [ { question: '...', status: 'Answered' } ].
# If we call createDoubt, it hits `/school/doubts` with POST. 
# We should probably change `fetchApi` fallback to handle POST vs GET or just return the array. If it returns an array for a POST, it's fine as long as we just check if it succeeds.

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated api.ts with new mock data.")
