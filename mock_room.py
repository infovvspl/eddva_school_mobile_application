import re

filepath = 'src/utils/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

mock_additions = """
  '/school/live/lectures/a47d7c18-97d8-4903-bdf2-f8c5c78b4f2c/chat': [
    { id: '1', userId: 'user1', userName: 'Alice', message: 'Hello teacher!', createdAt: '2026-07-17T12:00:00Z' },
    { id: '2', userId: 'user2', userName: 'Bob', message: 'I have a doubt about the previous slide.', createdAt: '2026-07-17T12:02:00Z' }
  ],
  '/school/live/lectures/a47d7c18-97d8-4903-bdf2-f8c5c78b4f2c/polls/active': {
    id: 'poll_123',
    question: 'What is the derivative of x^2?',
    options: ['x', '2x', 'x^2', '2'],
    status: 'ACTIVE'
  },
  '/school/live/lectures/c69f9e30-23fa-6125-df14-1ae7e90d614e/chat': [
    { id: '1', userId: 'user3', userName: 'Charlie', message: 'The stream looks great.', createdAt: '2026-07-17T12:00:00Z' }
  ],
  '/school/live/lectures/c69f9e30-23fa-6125-df14-1ae7e90d614e/polls/active': {
    id: 'poll_456',
    question: 'Which of these is a preposition?',
    options: ['Run', 'Quickly', 'Under', 'Beautiful'],
    status: 'ACTIVE'
  },
"""

# Insert at the end of mockData
content = re.sub(r"(const mockData: Record<string, any> = {)", r"\1\n" + mock_additions, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("api.ts updated with chat and polls mock data")
