import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Modal, FlatList, Image } from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { ArrowLeft, Image as ImageIcon, Sparkles, Send, ChevronDown, Check, X, Camera, Images } from 'lucide-react-native';
import { hs, vs, ms } from '../utils/responsive';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

// Keeps uploads reasonable and matches what the doubt list already renders as
// question photos (a phone-camera JPEG, not a raw multi-MB original).
const PICKER_OPTS = {
  mediaType: 'photo' as const,
  quality: 0.7 as const,
  maxWidth: 2000,
  maxHeight: 2000,
  includeBase64: false,
};

/**
 * Presigned-upload flow confirmed against the live API: POST /doubts/upload-url
 * with {fileName, contentType} returns {uploadUrl, fileUrl}; the file bytes are
 * PUT directly to uploadUrl, and fileUrl is what the doubt record stores as
 * questionImageUrl.
 */
const uploadDoubtImage = async (asset: Asset): Promise<string> => {
  const fileName = asset.fileName || `doubt-${Date.now()}.jpg`;
  const contentType = asset.type || 'image/jpeg';

  const res: any = await schoolApi.getDoubtUploadUrl({ fileName, contentType });
  const { uploadUrl, fileUrl } = res?.data ?? res;
  if (!uploadUrl || !fileUrl) throw new Error('Could not prepare the image upload.');

  // RN's fetch can read a local file:// URI into a Blob, which is what a raw
  // (non-multipart) presigned PUT needs.
  const blob = await (await fetch(asset.uri as string)).blob();
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!putRes.ok) throw new Error('The image upload was rejected. Please try again.');

  return fileUrl;
};

export function AskDoubtScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // /doubts/context supplies the class badge plus the subject and teacher lists
  // that drive the two pickers.
  const [context, setContext] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);   // null = "any subject"
  const [teacher, setTeacher] = useState<any>(null);   // null = auto-assign
  const [picker, setPicker] = useState<null | 'subject' | 'teacher'>(null);

  const [image, setImage] = useState<Asset | null>(null);
  const [imageSheetOpen, setImageSheetOpen] = useState(false);

  const pickFromCamera = async () => {
    setImageSheetOpen(false);
    const res = await launchCamera(PICKER_OPTS);
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Camera unavailable', res.errorMessage || 'Could not open the camera.');
      return;
    }
    if (res.assets?.[0]) setImage(res.assets[0]);
  };

  const pickFromLibrary = async () => {
    setImageSheetOpen(false);
    const res = await launchImageLibrary(PICKER_OPTS);
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Photos unavailable', res.errorMessage || 'Could not open your photo library.');
      return;
    }
    if (res.assets?.[0]) setImage(res.assets[0]);
  };

  useEffect(() => {
    schoolApi
      .getDoubtContext()
      .then((res: any) => setContext(res?.data ?? res))
      .catch((err: any) => console.warn('[askDoubt] context load failed', err));
  }, []);

  const subjects = context?.subjects ?? [];

  // The API returns one row per teacher/subject pair, so the same teacher
  // repeats. Narrow to the chosen subject, then de-duplicate by teacher id.
  const teachers = useMemo(() => {
    const rows = (context?.teachers ?? []).filter((t: any) =>
      subject ? t.subjectId === subject.id || t.isClassTeacher : true,
    );
    const byId = new Map<string, any>();
    rows.forEach((t: any) => { if (!byId.has(t.id)) byId.set(t.id, t); });
    return Array.from(byId.values());
  }, [context, subject]);

  // A teacher picked for one subject may not teach the next one.
  useEffect(() => {
    if (teacher && !teachers.some((t: any) => t.id === teacher.id)) setTeacher(null);
  }, [teachers, teacher]);

  // 'ai' routes to the AI answerer, 'teacher' escalates straight to a teacher.
  const handleSubmit = async (target: 'ai' | 'teacher') => {
    // A photo of the question stands in for typed detail, matching the
    // placeholder's own "text or image" allowance.
    if (!image && question.length < 10) {
      Alert.alert('Error', 'Please enter a longer question, or attach a photo of it.');
      return;
    }
    setIsSubmitting(true);
    try {
      const questionImageUrl = image ? await uploadDoubtImage(image) : undefined;
      await schoolApi.createDoubt({
        questionText: question,
        askTeacher: target === 'teacher',
        ...(questionImageUrl ? { questionImageUrl } : {}),
        ...(subject ? { subjectId: subject.id, subjectName: subject.name } : {}),
        // Only meaningful when routing to a person; ignored for AI answers.
        ...(teacher && target === 'teacher' ? { teacherId: teacher.id } : {}),
      });
      Alert.alert('Success', 'Doubt submitted successfully!');
      onNavigate('doubt');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit doubt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('doubt')} style={styles.backBtn}>
          <ArrowLeft size={ms(20)} color={theme.text} />
        </TouchableOpacity>
        <View style={{ marginLeft: hs(12) }}>
          <Text style={styles.headerTitle}>Ask a Doubt</Text>
          <Text style={styles.headerSubtitle}>Get instant help from AI or send your question to your subject teacher.</Text>
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>
              {context?.className
                ? `${context.className}${context.sectionName ? ` • Section ${context.sectionName}` : ''}`
                : ' '}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={styles.dropdownCol}>
            <Text style={styles.label}>SUBJECT (OPTIONAL)</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setPicker('subject')}
              disabled={isSubmitting}
            >
              <Text style={styles.dropdownText} numberOfLines={2}>
                {subject ? subject.name : 'General / any subject'}
              </Text>
              <ChevronDown size={ms(16)} color={theme.subtext} />
            </TouchableOpacity>
          </View>
          <View style={styles.dropdownCol}>
            <Text style={styles.label}>TEACHER (FOR DIRECT ASK)</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setPicker('teacher')}
              disabled={isSubmitting}
            >
              <Text style={styles.dropdownText} numberOfLines={2}>
                {teacher ? teacher.name : 'Auto-assign (class / subject teacher)'}
              </Text>
              <ChevronDown size={ms(16)} color={theme.subtext} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>YOUR QUESTION</Text>
          <TextInput 
            style={styles.textArea}
            placeholder="Describe what you are stuck on (text or image, min. 10 characters if text only)..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            value={question}
            onChangeText={setQuestion}
            editable={!isSubmitting}
          />
        </View>

        {image ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.imageRemoveBtn}
              onPress={() => setImage(null)}
              disabled={isSubmitting}
            >
              <X size={ms(14)} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.attachBtn}
            disabled={isSubmitting}
            onPress={() => setImageSheetOpen(true)}
          >
            <ImageIcon size={ms(14)} color={theme.subtext} />
            <Text style={styles.attachBtnText}>Attach question image</Text>
          </TouchableOpacity>
        )}

        {isSubmitting ? (
          <View style={{ marginTop: vs(20), alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ marginTop: vs(8), color: theme.subtext }}>Submitting...</Text>
          </View>
        ) : (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#C4B5FD' }]} onPress={() => handleSubmit('ai')}>
              <Sparkles size={ms(16)} color={theme.surface} />
              <Text style={styles.actionBtnText}>Ask AI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#93C5FD' }]} onPress={() => handleSubmit('teacher')}>
              <Send size={ms(16)} color={theme.surface} />
              <Text style={styles.actionBtnText}>Ask Teacher</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.footerNote}>AI ANSWERS INSTANTLY • TEACHER REPLIES WHEN AVAILABLE</Text>
      </ScrollView>

      <Modal
        visible={picker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPicker(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPicker(null)}
        >
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {picker === 'subject' ? 'Select subject' : 'Select teacher'}
              </Text>
              <TouchableOpacity onPress={() => setPicker(null)} style={styles.modalClose}>
                <X size={ms(20)} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={
                picker === 'subject'
                  ? [{ id: null, name: 'General / any subject' }, ...subjects]
                  : [{ id: null, name: 'Auto-assign (class / subject teacher)' }, ...teachers]
              }
              keyExtractor={(item: any, i: number) => String(item.id ?? `any-${i}`)}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>
                  {context ? 'Nothing available here.' : 'Loading...'}
                </Text>
              }
              renderItem={({ item }: any) => {
                const current = picker === 'subject' ? subject : teacher;
                const selected = (current?.id ?? null) === item.id;
                return (
                  <TouchableOpacity
                    style={styles.modalRow}
                    onPress={() => {
                      const value = item.id === null ? null : item;
                      if (picker === 'subject') setSubject(value);
                      else setTeacher(value);
                      setPicker(null);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalRowText, selected && styles.modalRowTextActive]}>
                        {item.name}
                      </Text>
                      {picker === 'teacher' && item.id !== null && item.subjectName && (
                        <Text style={styles.modalRowSub}>{item.subjectName}</Text>
                      )}
                    </View>
                    {selected && <Check size={ms(18)} color={theme.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={imageSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setImageSheetOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setImageSheetOpen(false)}
        >
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attach question image</Text>
              <TouchableOpacity onPress={() => setImageSheetOpen(false)} style={styles.modalClose}>
                <X size={ms(20)} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.modalRow} onPress={pickFromCamera}>
              <Camera size={ms(18)} color={theme.text} />
              <Text style={styles.modalRowText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalRow} onPress={pickFromLibrary}>
              <Images size={ms(18)} color={theme.text} />
              <Text style={styles.modalRowText}>Choose from Library</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    // The root SafeAreaView already insets the status bar on both platforms,
    // so this only needs breathing room below it -- not a second status bar.
    paddingTop: vs(12),
    paddingHorizontal: hs(20),
    paddingBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: theme.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(4),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '700',
    color: theme.text,
    marginBottom: vs(4),
  },
  headerSubtitle: {
    fontSize: ms(12),
    color: theme.subtext,
    marginBottom: vs(12),
    maxWidth: '90%',
  },
  classBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(6),
    alignSelf: 'flex-start',
  },
  classBadgeText: {
    fontSize: ms(11),
    color: theme.primary,
    fontWeight: '600',
  },
  content: {
    padding: ms(20),
  },
  row: {
    flexDirection: 'row',
    gap: ms(16),
    marginBottom: vs(20),
  },
  dropdownCol: {
    flex: 1,
  },
  label: {
    fontSize: ms(10),
    fontWeight: '700',
    color: theme.subtext,
    letterSpacing: 0.5,
    marginBottom: vs(8),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    paddingBottom: vs(24),
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(20),
    paddingTop: vs(16),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: theme.text,
  },
  modalClose: {
    padding: ms(4),
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    paddingHorizontal: hs(20),
    paddingVertical: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalRowText: {
    fontSize: ms(14),
    color: theme.text,
  },
  modalRowTextActive: {
    color: theme.primary,
    fontWeight: '700',
  },
  modalRowSub: {
    fontSize: ms(11),
    color: theme.subtext,
    marginTop: vs(2),
  },
  modalEmpty: {
    padding: ms(24),
    textAlign: 'center',
    color: theme.subtext,
    fontSize: ms(13),
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: ms(8),
    paddingHorizontal: hs(12),
    paddingVertical: vs(12),
  },
  dropdownText: {
    fontSize: ms(12),
    color: theme.text,
    flex: 1,
  },
  inputSection: {
    marginBottom: vs(16),
  },
  textArea: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: ms(8),
    padding: ms(16),
    height: vs(150),
    fontSize: ms(14),
    color: theme.text,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: hs(12),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    gap: ms(6),
    marginBottom: vs(32),
  },
  attachBtnText: {
    fontSize: ms(12),
    color: theme.subtext,
    fontWeight: '500',
  },
  imagePreviewWrap: {
    alignSelf: 'flex-start',
    marginBottom: vs(32),
  },
  imagePreview: {
    width: ms(120),
    height: ms(120),
    borderRadius: ms(12),
    backgroundColor: theme.surfaceAlt,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: -ms(8),
    right: -ms(8),
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: 'rgba(15,23,42,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: ms(16),
    marginBottom: vs(16),
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(14),
    borderRadius: ms(12),
    gap: ms(8),
  },
  actionBtnText: {
    color: theme.surface,
    fontSize: ms(14),
    fontWeight: '600',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: ms(10),
    color: theme.subtext,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
