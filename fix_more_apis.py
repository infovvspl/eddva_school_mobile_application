import re

filepath = 'src/utils/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Append to the bottom of the object export
additions = """
  // Add missing standard endpoints
  getMaterials: () => fetchApi('/school/materials'),
  getRecordings: () => fetchApi('/school/classes/recordings'),
  getNotifications: () => fetchApi('/school/notifications'),
  getEvents: () => fetchApi('/school/calendar/events'),
  getPlatformNotices: () => fetchApi('/school/notices/platform'),
  getAssessments: () => fetchApi('/school/assessments'),
};
"""

content = re.sub(r'};\s*$', additions, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added missing APIs to api.ts")
