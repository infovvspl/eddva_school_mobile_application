import re

filepath = 'src/utils/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

mock_data_additions = """
  '/school/live/lectures': [
    {
      id: "a47d7c18-97d8-4903-bdf2-f8c5c78b4f2c",
      title: "Mathematics Integration",
      description: "Introduction to Integration and Calculus",
      scheduledFor: "2026-07-17T12:00:00.000Z",
      status: "SCHEDULED",
      teacherName: "Pratap kumar Das",
      subjectName: "Mathematics",
      className: "Class 10",
      sectionName: "Section A"
    },
    {
      id: "b58e8d29-12e9-5014-ce03-09d6d89c503d",
      title: "Chemical Bonding",
      description: "Understanding covalent and ionic bonds",
      scheduledFor: "2026-07-18T10:00:00.000Z",
      status: "SCHEDULED",
      teacherName: "Dr. Smith",
      subjectName: "Science",
      className: "Class 10",
      sectionName: "Section A"
    }
  ],
  '/school/live/lectures/live': [
    {
      id: "c69f9e30-23fa-6125-df14-1ae7e90d614e",
      title: "English Grammar Rules",
      status: "LIVE",
      streamKey: "stream_english123",
      teacherName: "Mrs. Davis",
      subjectName: "English"
    }
  ],
  '/school/live/recordings': [
    {
      id: "e5c4d3b2-a109-876f-edcb-a10293847561",
      title: "Introduction to Algebra",
      recordedAt: "2026-07-16T10:00:00.000Z",
      duration: 3600,
      subjectName: "Mathematics",
      teacherName: "Pratap kumar Das"
    },
    {
      id: "f6d5e4c3-b210-9870-fedc-b21304958672",
      title: "History of World War II",
      recordedAt: "2026-07-15T09:30:00.000Z",
      duration: 4200,
      subjectName: "History",
      teacherName: "Mr. Brown"
    }
  ],
"""

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

# Insert mock data
content = content.replace("const mockData: Record<string, any> = {", "const mockData: Record<string, any> = {" + mock_data_additions)

# Insert API methods
content = content.replace("};", api_methods_additions + "\n};")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated api.ts with Live Classes mock data and methods.")
