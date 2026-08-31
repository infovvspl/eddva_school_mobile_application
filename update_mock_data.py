import re

filepath = 'src/utils/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

mock_data_additions = """
  '/school/students/profile/me': {
    name: 'Alex Johnson',
    className: 'Class 10 - A',
    school: 'Springfield High',
    avatarInitials: 'AJ'
  },
  '/auth/login': {
    token: 'mock-jwt-token-12345',
    user: { id: 'user-123', name: 'Alex Johnson' }
  },
"""

content = content.replace("'/school/students/dashboard': { streak: 12, points: 2450, level: 'Gold' },",
                          "'/school/students/dashboard': { streak: 12, points: 2450, level: 'Gold' },\n" + mock_data_additions)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated api.ts with new mock data.")
