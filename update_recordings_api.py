import os

api_path = 'src/utils/api.ts'
with open(api_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update mock data for recordings
old_recordings = """  '/school/classes/recordings': [
    { id: 1, title: 'Calculus 101', duration: '45 mins', date: 'Yesterday' },
    { id: 2, title: 'World History', duration: '50 mins', date: 'Monday' }
  ],"""

new_recordings = """  '/school/classes/recordings': [
    { 
      id: 'f1d292ee-a69e-46a4-8e7a-b60d6e00d443', 
      subject: 'MATHEMATICS', 
      title: 'Real Number', 
      chapter: 'Real Numbers', 
      duration: '8 min', 
      aiNotesReady: true, 
      date: '24/08/2026', 
      progress: '8.4 mins',
      hasNotes: true
    },
    { 
      id: '2', 
      subject: 'HISTORY', 
      title: 'Introduction to Nationalism and Imperialism', 
      chapter: 'Nationalism in India', 
      duration: '57 min', 
      aiNotesReady: true, 
      date: '20/08/2026', 
      progress: 'Pending',
      hasNotes: true
    },
    { 
      id: '3', 
      subject: 'MATHEMATICS', 
      title: 'Introduction to Polynomial', 
      chapter: 'Polynomials', 
      duration: '57 min', 
      aiNotesReady: true, 
      date: '16/08/2026', 
      progress: '57:00 mins',
      hasNotes: true
    },
    { 
      id: '4', 
      subject: 'MATHEMATICS', 
      title: 'Real Number', 
      chapter: 'General chapter', 
      duration: '57 min', 
      aiNotesReady: true, 
      date: '12/08/2026', 
      progress: 'Pending',
      hasNotes: true
    }
  ],"""

content = content.replace(old_recordings, new_recordings)

# Add getRecordingProgress
old_api = """  getRecordings: () => fetchApi('/school/classes/recordings'),"""
new_api = """  getRecordings: () => fetchApi('/school/classes/recordings'),
  getRecordingProgress: (id: string) => fetchApi(`/school/classes/recordings/${id}/progress`),"""

content = content.replace(old_api, new_api)

# Need to handle the param route in fetchApi mock fallback
param_route_add = """    if (endpoint.startsWith('/school/doubts/')) {
       return new Promise(resolve => setTimeout(() => resolve(mockData['/school/doubts'][0]), 800));
    }"""
param_route_new = """    if (endpoint.startsWith('/school/doubts/')) {
       return new Promise(resolve => setTimeout(() => resolve(mockData['/school/doubts'][0]), 800));
    }
    if (endpoint.includes('/progress')) {
       return new Promise(resolve => setTimeout(() => resolve({ watched: '8.4 mins', completed: false }), 800));
    }"""

content = content.replace(param_route_add, param_route_new)

with open(api_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("api.ts updated successfully")
