import re

filepath = 'src/utils/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "// --- NEW LIVE CLASSES APIs ---" in line:
        skip = True
    elif skip and ("getRecordingUrl:" in line or "getAllPolls" in line or "getLiveRecordings" in line or "votePoll" in line or "getActivePoll" in line or "getLiveChat" in line or "raiseHand" in line or "getStreamUrl" in line or "getActiveLiveLectures" in line or "getScheduledLiveLectures" in line):
        continue
    elif skip and line.strip() == "":
        skip = False
    else:
        new_lines.append(line)

content = "".join(new_lines)

# Now insert properly at the end of `mockData` and `schoolApi`
# mockData is defined as `const mockData: Record<string, any> = {`
# We already inserted mock_data inside mockData. Let's check if it's there.
if "'/school/live/lectures': [" not in content:
    content = content.replace("const mockData: Record<string, any> = {", "const mockData: Record<string, any> = {\n  '/school/live/lectures': [\n    {\n      id: 'a47d7c18-97d8-4903-bdf2-f8c5c78b4f2c',\n      title: 'Mathematics Integration',\n      description: 'Introduction to Integration and Calculus',\n      scheduledFor: '2026-07-17T12:00:00.000Z',\n      status: 'SCHEDULED',\n      teacherName: 'Pratap kumar Das',\n      subjectName: 'Mathematics',\n      className: 'Class 10',\n      sectionName: 'Section A'\n    },\n    {\n      id: 'b58e8d29-12e9-5014-ce03-09d6d89c503d',\n      title: 'Chemical Bonding',\n      description: 'Understanding covalent and ionic bonds',\n      scheduledFor: '2026-07-18T10:00:00.000Z',\n      status: 'SCHEDULED',\n      teacherName: 'Dr. Smith',\n      subjectName: 'Science',\n      className: 'Class 10',\n      sectionName: 'Section A'\n    }\n  ],\n  '/school/live/lectures/live': [\n    {\n      id: 'c69f9e30-23fa-6125-df14-1ae7e90d614e',\n      title: 'English Grammar Rules',\n      status: 'LIVE',\n      streamKey: 'stream_english123',\n      teacherName: 'Mrs. Davis',\n      subjectName: 'English'\n    }\n  ],\n  '/school/live/recordings': [\n    {\n      id: 'e5c4d3b2-a109-876f-edcb-a10293847561',\n      title: 'Introduction to Algebra',\n      recordedAt: '2026-07-16T10:00:00.000Z',\n      duration: 3600,\n      subjectName: 'Mathematics',\n      teacherName: 'Pratap kumar Das'\n    },\n    {\n      id: 'f6d5e4c3-b210-9870-fedc-b21304958672',\n      title: 'History of World War II',\n      recordedAt: '2026-07-15T09:30:00.000Z',\n      duration: 4200,\n      subjectName: 'History',\n      teacherName: 'Mr. Brown'\n    }\n  ],")


api_methods_additions = """
  // --- NEW LIVE CLASSES APIs ---
  getScheduledLiveLectures: () => fetchApi('/school/live/lectures'),
  getActiveLiveLectures: () => fetchApi('/school/live/lectures/live'),
  getStreamUrl: (id: string) => fetchApi(`/school/live/lectures/${id}/stream-url`),
  raiseHand: (id: string, raised: boolean) => fetchApi(`/school/live/lectures/${id}/hand`, { method: 'POST', body: JSON.stringify({ raised }) }),
  getLiveChat: (id: string) => fetchApi(`/school/live/lectures/${id}/chat`),
  getActivePoll: (id: string) => fetchApi(`/school/live/lectures/${id}/polls/active`),
  votePoll: (id: string, pollId: string, option: string) => fetchApi(`/school/live/lectures/${id}/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify({ option }) }),
  getAllPolls: (id: string) => fetchApi(`/school/live/lectures/${id}/polls`),
  getLiveRecordings: () => fetchApi('/school/live/recordings'),
  getRecordingUrl: (id: string) => fetchApi(`/school/live/lectures/${id}/recording-url`),
"""

# Now insert properly at the end of schoolApi
content = re.sub(r'(export const schoolApi = {.*?)(};)', r'\1' + api_methods_additions + r'\2', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("api.ts repaired.")
