with open('src/screens/AssessmentsScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                    <View style={styles.cardActions}>
                      <View style={styles.submittedOnlineBtn}>
                        <CheckCircle size={ms(14)} color="#10B981" />
                        <Text style={styles.submittedOnlineText}>Submitted online</Text>
                      </View>
                      <View style={styles.submittedOfflineBtn}>
                        <Text style={styles.submittedOfflineText}>Submitted</Text>
                      </View>
                      <TouchableOpacity style={styles.viewSubmissionBtn}>
                        <FileText size={ms(14)} color={theme.primary} />
                        <Text style={styles.viewSubmissionText}>View my submission</Text>
                      </TouchableOpacity>
                    </View>"""

replacement = """                    <View style={styles.cardActions}>
                      <TouchableOpacity style={[styles.submittedOnlineBtn, { backgroundColor: theme.primary, borderWidth: 0 }]} onPress={() => onNavigate('exam')}>
                        <Text style={[styles.submittedOnlineText, { color: '#fff' }]}>Start Exam</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.viewSubmissionBtn}>
                        <FileText size={ms(14)} color={theme.primary} />
                        <Text style={styles.viewSubmissionText}>View details</Text>
                      </TouchableOpacity>
                    </View>"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/screens/AssessmentsScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched AssessmentsScreen")
else:
    print("Target not found")
