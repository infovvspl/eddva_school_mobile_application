import os

careers_path = 'src/screens/CareersScreen.tsx'
with open(careers_path, 'r', encoding='utf-8') as f:
    c_content = f.read()

target = """    fetchGuidance();
  }, []);
        
        {/* Explore Careers Section */}"""

replacement = """    fetchGuidance();
  }, []);

  if (loading) {
    return <View style={styles.container}><ActivityIndicator color="#2563EB" style={{marginTop: 50}} /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Compass size={20} color="#2563EB" style={{ marginRight: 8 }} />
          <Text style={styles.pageTitle}>Career Guidance</Text>
        </View>
        <Text style={styles.pageSub}>Discover your strengths and ideal career path</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Explore Careers Section */}"""

c_content = c_content.replace(target, replacement)

# data replacements
c_content = c_content.replace('Investigative + Social', '{data?.type || "Investigative + Social"}')
c_content = c_content.replace('2mo 1d 23h 50m 38s', '{data?.retakeUnlockedIn || "2mo 1d 23h 50m 38s"}')
c_content = c_content.replace('Needs work: Mathematics', 'Needs work: {data?.needsWork || "Mathematics"}')

with open(careers_path, 'w', encoding='utf-8') as f:
    f.write(c_content)

# Fix api.ts
api_path = 'src/utils/api.ts'
with open(api_path, 'r', encoding='utf-8') as f:
    a_content = f.read()

if 'getDashboardStats:' not in a_content:
    a_content = a_content.replace(
        "  getProfile: () => fetchApi('/school/students/dashboard'),",
        "  getProfile: () => fetchApi('/school/students/dashboard'),\n  getDashboardStats: () => fetchApi('/school/students/dashboard'),\n  getTimetable: () => fetchApi('/school/timetables/student/me'),"
    )

with open(api_path, 'w', encoding='utf-8') as f:
    f.write(a_content)

print("Fixed CareersScreen and api.ts")
