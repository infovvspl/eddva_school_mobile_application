import re

filepath = 'src/utils/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add a mock AI Quiz
mock_quiz_obj = """
  '/school/topics/default/ai-quiz/generate': {
    title: 'Calculus Fundamentals (AI Generated)',
    questions: [
      { id: 1, type: 'Multiple Choice', difficulty: 'Medium', text: 'What is the derivative of x^2?', options: ['x', '2x', 'x^2', '2'] },
      { id: 2, type: 'Multiple Choice', difficulty: 'Hard', text: 'Evaluate the limit of sin(x)/x as x approaches 0.', options: ['0', '1', 'Infinity', 'Undefined'] },
      { id: 3, type: 'Multiple Choice', difficulty: 'Easy', text: 'What is the integral of 2x dx?', options: ['x^2 + C', 'x + C', '2x^2 + C', 'x^3 / 3 + C'] }
    ]
  },
  '/school/study-plans/generate': { success: true },
"""

content = content.replace("'/school/career/explore': [", mock_quiz_obj + "\n  '/school/career/explore': [")

# Add the fallbacks in fetchApi
fallback_code = """
    if (endpoint.startsWith('/school/doubts/')) {
       return new Promise(resolve => setTimeout(() => resolve(mockData['/school/doubts'][0]), 800));
    }
    
    // Fallback for AI Quiz Generate
    if (endpoint.match(/^\\/school\\/topics\\/.*\\/ai-quiz\\/generate$/)) {
       return new Promise(resolve => setTimeout(() => resolve(mockData['/school/topics/default/ai-quiz/generate']), 800));
    }

    // Fallback for study plan complete/skip
    if (endpoint.match(/^\\/school\\/study-plans\\/items\\/.*\\/(complete|skip)$/)) {
       return new Promise(resolve => setTimeout(() => resolve({ success: true }), 400));
    }
"""

content = content.replace("""    if (endpoint.startsWith('/school/doubts/')) {
       return new Promise(resolve => setTimeout(() => resolve(mockData['/school/doubts'][0]), 800));
    }""", fallback_code)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Mock data added to api.ts!")
