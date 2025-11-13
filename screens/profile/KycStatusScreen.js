import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  PermissionsAndroid,
  Modal,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DocumentPicker, { isCancel } from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';

import { KYC_DOCUMENTS, KYC_STATUS_META } from '../../config/kycDocuments';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { upsertKycDocument, removeKycDocument, setKycApproved } from '../../store/slices/profileSlice';

const renderIcon = (iconType, iconName, size = 32) => {
  const tint = colors.primary;
  switch (iconType) {
    case 'FontAwesome5':
      return <FontAwesome5 name={iconName} size={size} color={tint} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={iconName} size={size} color={tint} />;
    case 'MaterialIcons':
    default:
      return <MaterialIcons name={iconName} size={size} color={tint} />;
  }
};

const getNextDocument = (documents = {}) => {
  const available = KYC_DOCUMENTS.find((doc) => !documents[doc.id]);
  return available || KYC_DOCUMENTS[0];
};

export default function KycStatusScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const storedDocuments = useSelector((state) => state.profile.kyc.documents);
  const kycApproved = useSelector((state) => state.profile.kyc.isApproved);

  const [uploadVisible, setUploadVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(getNextDocument(storedDocuments));
  const [documentNumber, setDocumentNumber] = useState('');
  const [focusedInput, setFocusedInput] = useState('type');
  const [showDocumentTypeList, setShowDocumentTypeList] = useState(false);
  const [draftSelection, setDraftSelection] = useState(null);
  const approvalTimersRef = useRef({});
  const isPickingImageRef = useRef(false);
  const storedDocumentsRef = useRef(storedDocuments);

  // Keep ref in sync with current documents
  useEffect(() => {
    storedDocumentsRef.current = storedDocuments;
  }, [storedDocuments]);

  useEffect(() => {
    setSelectedDocument(getNextDocument(storedDocuments));
  }, [storedDocuments]);

  // Auto-approve each document 10 seconds after upload, then approve KYC when all are approved
  useEffect(() => {
    if (kycApproved) {
      // Clear all timers if KYC is already approved
      Object.values(approvalTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      approvalTimersRef.current = {};
      return;
    }

    // Check each document and set approval timer if needed
    KYC_DOCUMENTS.forEach((docDef) => {
      const doc = storedDocuments[docDef.id];
      const docId = docDef.id.toString();

      // If document is uploaded but not yet approved
      if (doc && doc.uri && doc.status !== 'approved') {
        // If timer already exists, clear it first (document was replaced)
        if (approvalTimersRef.current[docId]) {
          clearTimeout(approvalTimersRef.current[docId]);
        }

        // Store the document URI when timer starts to ensure we approve the right document
        const documentUri = doc.uri;
        const documentId = docDef.id;

        // Start a new timer for this document
        approvalTimersRef.current[docId] = setTimeout(() => {
          // Get the current document state to ensure we're approving the right one
          const currentDoc = storedDocumentsRef.current[documentId];
          // Only approve if the URI matches (document wasn't replaced) and status is still pending
          if (currentDoc && currentDoc.uri === documentUri && currentDoc.status !== 'approved') {
            dispatch(
              upsertKycDocument({
                id: documentId,
                title: docDef.title,
                number: currentDoc.number || '',
                fileName: currentDoc.fileName || '',
                uri: currentDoc.uri,
                type: currentDoc.type || '',
                size: currentDoc.size || null,
                status: 'approved',
              }),
            );
          }
          // Clear the timer reference
          delete approvalTimersRef.current[docId];
        }, 4000);
      }
      // If document is already approved, clear any existing timer
      else if (doc && doc.status === 'approved' && approvalTimersRef.current[docId]) {
        clearTimeout(approvalTimersRef.current[docId]);
        delete approvalTimersRef.current[docId];
      }
      // If document doesn't exist or has no URI, clear any existing timer
      else if (!doc || !doc.uri) {
        if (approvalTimersRef.current[docId]) {
          clearTimeout(approvalTimersRef.current[docId]);
          delete approvalTimersRef.current[docId];
        }
      }
    });

    // Check if all documents are approved, then approve KYC
    const allApproved = KYC_DOCUMENTS.every((docDef) => {
      const doc = storedDocuments[docDef.id];
      return doc && doc.uri && doc.status === 'approved';
    });

    if (allApproved && KYC_DOCUMENTS.every((docDef) => storedDocuments[docDef.id]?.uri)) {
      // All documents are approved, approve KYC immediately
      dispatch(setKycApproved(true));
    }

    return () => {
      // Cleanup is handled by the ref, but we can clear on unmount
      Object.values(approvalTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [dispatch, storedDocuments, kycApproved]);

  const pendingCount = useMemo(() => {
    // Count approved documents
    const approvedCount = KYC_DOCUMENTS.filter((docDef) => {
      const doc = storedDocuments[docDef.id];
      return doc && doc.uri && doc.status === 'approved';
    }).length;

    // Remaining documents = 4 - approved count
    return KYC_DOCUMENTS.length - approvedCount;
  }, [storedDocuments]);

  const handleOpenModal = (doc) => {
    const existing = storedDocuments[doc.id];
    setSelectedDocument(doc);
    setDocumentNumber(existing?.number || '');
    setDraftSelection(existing ? { ...existing } : null);
    setFocusedInput('type');
    setShowDocumentTypeList(false);
    setUploadVisible(true);
  };

  const handleDelete = (doc) => {
    dispatch(removeKycDocument(doc.id));
  };

  const handleSelectDocumentType = (doc) => {
    const existing = storedDocuments[doc.id];
    setSelectedDocument(doc);
    setDocumentNumber(existing?.number || '');
    setDraftSelection(existing ? { ...existing } : null);
    setShowDocumentTypeList(false);
    setFocusedInput(null);
  };

  const handleRequestGalleryPermission = async () => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handlePickDocument = async () => {
    if (!selectedDocument) {
      return;
    }

    // Prevent multiple simultaneous calls
    if (isPickingImageRef.current) {
      return;
    }

    try {
      if (selectedDocument.title === 'Profile Photo') {
        isPickingImageRef.current = true;
        const permitted = await handleRequestGalleryPermission();
        if (!permitted) {
          isPickingImageRef.current = false;
          Alert.alert(
            'Permission needed',
            'Please allow photo library access to upload your profile photo.',
          );
          return;
        }

        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.85,
          selectionLimit: 1,
          includeBase64: false,
        });

        isPickingImageRef.current = false;

        if (!result.didCancel && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setDraftSelection({
            id: selectedDocument.id,
            title: selectedDocument.title,
            fileName: asset.fileName || 'Selected Photo',
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize || null,
            status: 'pending',
          });
        }
      } else {
        isPickingImageRef.current = true;
        const file = await DocumentPicker.pickSingle({
          type: DocumentPicker.types.allFiles,
          copyTo: 'cachesDirectory',
        });

        isPickingImageRef.current = false;

        setDraftSelection({
          id: selectedDocument.id,
          title: selectedDocument.title,
          fileName: file.name,
          uri: file.fileCopyUri || file.uri,
          type: file.type || 'application/octet-stream',
          size: file.size ?? null,
          status: 'pending',
        });
      }
    } catch (error) {
      isPickingImageRef.current = false;
      if (isCancel(error)) {
        return;
      }
      console.error('Document pick error', error);
      Alert.alert(
        'Upload failed',
        'Something went wrong while selecting the document. Please try again.',
      );
    }
  };

  const handleSaveDocument = () => {
    if (!draftSelection) {
      Alert.alert('Missing document', 'Please pick a document to upload.');
      return;
    }

    dispatch(
      upsertKycDocument({
        id: selectedDocument.id,
        title: selectedDocument.title,
        number: documentNumber,
        fileName: draftSelection.fileName || draftSelection.name || '',
        uri: draftSelection.uri,
        type: draftSelection.type,
        size: draftSelection.size,
        status: draftSelection.status || 'pending',
      }),
    );

    setUploadVisible(false);
    setDraftSelection(null);
    setShowDocumentTypeList(false);
    setFocusedInput('type');
  };

  const handleCloseModal = () => {
    setUploadVisible(false);
    setDraftSelection(null);
    setFocusedInput('type');
    setShowDocumentTypeList(false);
  };

  const renderDocumentCard = (doc) => {
    const statusMeta = KYC_STATUS_META[doc.status || 'pending'];
    const canDelete = doc.status !== 'approved';
    return (
      <View key={doc.id} style={styles.itemCard}>
        <View style={styles.itemIcon}>{renderIcon(doc.iconType, doc.icon, 32)}</View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{doc.title}</Text>
          <Text style={styles.itemSubtitle}>{doc.number || 'No document number'}</Text>
        </View>
        <View style={styles.statusPill}>
          <Image source={statusMeta.icon} style={styles.statusIcon} />
          <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
        </View>
        <TouchableOpacity
          style={styles.itemAction}
          onPress={() =>
            handleOpenModal(
              KYC_DOCUMENTS.find((definition) => definition.id === doc.id) || KYC_DOCUMENTS[0],
            )
          }
          activeOpacity={0.85}
        >
          <MaterialIcons name="edit" size={22} color={colors.primary} />
        </TouchableOpacity>
        {canDelete && (
          <TouchableOpacity
            style={styles.itemDelete}
            onPress={() =>
              Alert.alert(
                'Remove document',
                `Are you sure you want to remove ${doc.title}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDelete(doc),
                  },
                ],
                { cancelable: true },
              )
            }
            activeOpacity={0.85}
          >
            <MaterialIcons name="delete-outline" size={22} color={colors.primaryDark} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const storedDocsArray = useMemo(() => {
    return KYC_DOCUMENTS.map((definition) => {
      const record = storedDocuments[definition.id];
      if (record) {
        return {
          ...definition,
          ...record,
        };
      }
      return null;
    }).filter(Boolean);
  }, [storedDocuments]);

  return (
    <LinearGradient
      colors={getGradientColors()}
      locations={getGradientLocations()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update KYC</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.noticeCard}>
            <MaterialIcons name="info" size={22} color={colors.primaryDark} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeText}>
                Your documents are now submitted for review. Your account will activate upon passing
                the thorough background checks, immigration status, and screening process.
              </Text>
              <Text style={styles.noticeStatus}>
                {pendingCount === 0 && storedDocsArray.length === KYC_DOCUMENTS.length
                  ? 'All documents approved'
                  : `${pendingCount} verification${pendingCount > 1 ? 's' : ''} remaining`}
              </Text>
            </View>
          </View>

          {storedDocsArray.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="folder-open" size={48} color="#FFFFFF" />
              <Text style={styles.emptyTitle}>No documents submitted</Text>
              <Text style={styles.emptySubtitle}>
                Tap the add button below to upload your first verification document.
              </Text>
            </View>
          ) : (
            storedDocsArray.map(renderDocumentCard)
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => handleOpenModal(getNextDocument(storedDocuments))}
      >
        <MaterialIcons name="add" size={28} color={colors.textLight} />
      </TouchableOpacity>

      <Modal visible={uploadVisible} transparent animationType="fade" onRequestClose={handleCloseModal}>
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <KeyboardAvoidingView
            style={styles.modalWrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Upload Document</Text>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteText}>
                    Document Upload Size limit: 2MB or less. Please check file size to avoid issues.
                  </Text>
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Document Type</Text>
                  <TouchableOpacity
                    style={[
                      styles.modalSelectInput,
                      focusedInput === 'type' ? styles.modalInputFocused : styles.modalInputBlurred,
                    ]}
                    onPress={() => {
                      const next = !showDocumentTypeList;
                      setShowDocumentTypeList(next);
                      setFocusedInput(next ? 'type' : null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalSelectText}>{selectedDocument.title}</Text>
                    <MaterialIcons
                      name={showDocumentTypeList ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={22}
                      color={colors.textDark}
                    />
                  </TouchableOpacity>
                  {showDocumentTypeList && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView nestedScrollEnabled>
                        {KYC_DOCUMENTS.map((doc) => {
                          const isSelected = doc.id === selectedDocument.id;
                          return (
                            <TouchableOpacity
                              key={doc.id}
                              style={[
                                styles.dropdownItem,
                                isSelected && styles.dropdownItemActive,
                              ]}
                              onPress={() => handleSelectDocumentType(doc)}
                              activeOpacity={0.9}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  isSelected && styles.dropdownItemTextActive,
                                ]}
                              >
                                {doc.title}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Document number</Text>
                  <TextInput
                    style={[
                      styles.modalInput,
                      focusedInput === 'number' ? styles.modalInputFocused : styles.modalInputBlurred,
                    ]}
                    placeholder={`Enter ${selectedDocument.title} number`}
                    placeholderTextColor={colors.textMuted}
                    value={documentNumber}
                    onChangeText={setDocumentNumber}
                    onFocus={() => {
                      setFocusedInput('number');
                      setShowDocumentTypeList(false);
                    }}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Document</Text>
                  <TouchableOpacity style={styles.pickDocumentButton} onPress={handlePickDocument}>
                    <MaterialIcons name="file-upload" size={20} color={colors.primary} />
                    <Text style={styles.pickDocumentText}>Pick Document</Text>
                  </TouchableOpacity>
                  {draftSelection && (
                    <View style={styles.fileInfoRow}>
                      <MaterialIcons
                        name="insert-drive-file"
                        size={18}
                        color={colors.textMuted}
                        style={styles.fileInfoIcon}
                      />
                      <Text style={styles.fileInfoName} numberOfLines={1}>
                        {draftSelection.fileName || draftSelection.name}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCloseModal}
                  >
                    <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveDocument}
                  >
                    <Text style={[styles.modalButtonText, styles.saveButtonText]}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    marginVertical: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  headerSpacer: {
    width: 36,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 213, 79, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 6,
  },
  noticeStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#F5F5F5',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  itemIcon: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FA',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 12,
  },
  statusIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemAction: {
    padding: 6,
  },
  itemDelete: {
    padding: 6,
    marginLeft: 2,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'left',
  },
  noteContainer: {
    backgroundColor: 'rgba(255, 213, 79, 0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 13,
    color: colors.textDark,
  },
  modalField: {
    marginBottom: 18,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalSelectInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
  },
  modalInputBlurred: {
    borderColor: colors.borderDivider,
  },
  modalSelectText: {
    fontSize: 15,
    color: colors.textDark,
    flex: 1,
    marginRight: 12,
  },
  dropdownContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderDivider,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    maxHeight: 220,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(12, 64, 58, 0.08)',
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.textDark,
  },
  dropdownItemTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textDark,
    backgroundColor: colors.backgroundCard,
  },
  modalInputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  pickDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(12, 64, 58, 0.08)',
  },
  pickDocumentText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  fileInfoIcon: {
    marginRight: 8,
  },
  fileInfoName: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: colors.backgroundLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: colors.textDark,
  },
  saveButtonText: {
    color: colors.textLight,
  },
});

