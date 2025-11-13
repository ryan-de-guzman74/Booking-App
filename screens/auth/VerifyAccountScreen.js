import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  TouchableWithoutFeedback,
  Alert,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, StackActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import BackButton from '../../components/BackButton';
import BottomNav from '../../components/BottomNav';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import DocumentPicker, { isCancel } from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { upsertKycDocument, setKycApproved } from '../../store/slices/profileSlice';
import { KYC_DOCUMENTS } from '../../config/kycDocuments';

const { width: screenWidth } = Dimensions.get('window');
const CHECK_ICON = require('../../assets/img/auth/check2.png');

export default function VerifyAccountScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const storedKycDocuments = useSelector((state) => state.profile.kyc.documents);
  const kycApproved = useSelector((state) => state.profile.kyc.isApproved);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(KYC_DOCUMENTS[0]);
  const [documentNumber, setDocumentNumber] = useState('');
  const [showDocumentTypeList, setShowDocumentTypeList] = useState(false);
  const [documentSelections, setDocumentSelections] = useState({});
  const [documentNumbers, setDocumentNumbers] = useState({});
  const [focusedInput, setFocusedInput] = useState('type');
  const approvalTimersRef = useRef({});
  const isPickingImageRef = useRef(false);
  const storedKycDocumentsRef = useRef(storedKycDocuments);
  
  // Keep ref in sync with current documents
  useEffect(() => {
    storedKycDocumentsRef.current = storedKycDocuments;
  }, [storedKycDocuments]);

  const CARD_MIN_HEIGHT = 80;
  const iconSize = CARD_MIN_HEIGHT * 0.4;

  useEffect(() => {
    const cloned = Object.entries(storedKycDocuments || {}).reduce((acc, [id, record]) => {
      acc[id] = { ...record };
      return acc;
    }, {});
    setDocumentSelections(cloned);
    const numberMap = Object.entries(storedKycDocuments || {}).reduce((acc, [id, record]) => {
      acc[id] = record.number || '';
      return acc;
    }, {});
    setDocumentNumbers(numberMap);
  }, [storedKycDocuments]);

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
      const doc = storedKycDocuments[docDef.id];
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
          const currentDoc = storedKycDocumentsRef.current[documentId];
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
        }, 10000);
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
      const doc = storedKycDocuments[docDef.id];
      return doc && doc.uri && doc.status === 'approved';
    });

    if (allApproved && KYC_DOCUMENTS.every((docDef) => storedKycDocuments[docDef.id]?.uri)) {
      // All documents are approved, approve KYC immediately
      dispatch(setKycApproved(true));
    }

    return () => {
      // Cleanup is handled by the ref, but we can clear on unmount
      Object.values(approvalTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [storedKycDocuments, dispatch, kycApproved]);

  const renderIcon = (iconType, iconName) => {
    const iconColor = colors.primary;

    switch (iconType) {
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName} size={iconSize} color={iconColor} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName} size={iconSize} color={iconColor} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  const handleOpenUploadModal = (doc) => {
    setSelectedDocument(doc);
    setShowUploadModal(true);
    setFocusedInput('type');
    setShowDocumentTypeList(true);

    if (documentSelections[doc.id]) {
      setDocumentNumber(documentNumbers[doc.id] || '');
    } else {
      setDocumentNumber(documentNumbers[doc.id] || '');
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setShowDocumentTypeList(false);
    setFocusedInput('type');
    const cloned = Object.entries(storedKycDocuments || {}).reduce((acc, [id, record]) => {
      acc[id] = { ...record };
      return acc;
    }, {});
    setDocumentSelections(cloned);
  };

  const handleSelectDocumentType = (doc) => {
    setSelectedDocument(doc);
    setDocumentNumber(documentNumbers[doc.id] || '');
    setShowDocumentTypeList(false);
    setFocusedInput(null);
  };

  const requestGalleryPermission = async () => {
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
    if (!selectedDocument) return;

    // Prevent multiple simultaneous calls
    if (isPickingImageRef.current) {
      return;
    }

    try {
      if (selectedDocument.title === 'Profile Photo') {
        isPickingImageRef.current = true;
        const permitted = await requestGalleryPermission();
        if (!permitted) {
          isPickingImageRef.current = false;
          Alert.alert('Permission needed', 'Please allow photo library access to upload your profile photo.');
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
          setDocumentSelections((prev) => ({
            ...prev,
            [selectedDocument.id]: {
              id: selectedDocument.id,
              title: selectedDocument.title,
              fileName: asset.fileName || 'Selected Photo',
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              size: asset.fileSize || null,
              status: 'pending',
            },
          }));
        }
      } else {
        isPickingImageRef.current = true;
        const file = await DocumentPicker.pickSingle({
          type: DocumentPicker.types.allFiles,
          copyTo: 'cachesDirectory',
        });

        isPickingImageRef.current = false;

        setDocumentSelections((prev) => ({
          ...prev,
          [selectedDocument.id]: {
            id: selectedDocument.id,
            title: selectedDocument.title,
            name: file.name,
            fileName: file.name,
            uri: file.fileCopyUri || file.uri,
            type: file.type || 'application/octet-stream',
            size: file.size ?? null,
            status: 'pending',
          },
        }));
      }
    } catch (error) {
      isPickingImageRef.current = false;
      if (isCancel(error)) {
        return;
      }

      console.error('Document pick error', error);
      Alert.alert('Upload failed', 'Something went wrong while selecting the document. Please try again.');
    }
  };

  const handleConfirmUpload = () => {
    if (!selectedDocument) {
      handleCloseUploadModal();
      return;
    }

    const selection = documentSelections[selectedDocument.id];
    if (!selection) {
      Alert.alert('Missing document', 'Please pick a document to upload.');
      return;
    }

    dispatch(
      upsertKycDocument({
        id: selectedDocument.id,
        title: selectedDocument.title,
        number: documentNumber,
        fileName: selection.fileName || selection.name || '',
        uri: selection.uri,
        type: selection.type,
        size: selection.size,
        status: 'pending',
      }),
    );

    setDocumentNumbers((prev) => ({
      ...prev,
      [selectedDocument.id]: documentNumber,
    }));

    handleCloseUploadModal();
  };

  const currentSelection = selectedDocument ? documentSelections[selectedDocument.id] : null;

  return (
    <LinearGradient
      colors={getGradientColors()}
      locations={getGradientLocations()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Account</Text>
          <Text style={styles.instruction}>
            Before you can get started, please upload the following documents.
          </Text>
        </View>

        <View style={styles.documentsContainer}>
          {KYC_DOCUMENTS.map((doc) => (
            <View key={doc.id} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>{renderIcon(doc.iconType, doc.icon)}</View>
                <View style={styles.cardTextWrapper}>
                  <Text style={styles.cardTitle}>{doc.title}</Text>
                  {documentSelections[doc.id] && (
                    <Text style={styles.selectedFileName} numberOfLines={1}>
                      {documentSelections[doc.id].fileName || documentSelections[doc.id].name}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    documentSelections[doc.id] && styles.uploadButtonSuccess,
                  ]}
                  onPress={() => handleOpenUploadModal(doc)}
                  activeOpacity={0.85}
                >
                  {documentSelections[doc.id] ? (
                    <Image source={CHECK_ICON} style={styles.checkIcon} resizeMode="contain" />
                  ) : (
                    <MaterialIcons name="file-upload" size={20} color={colors.primary} />
                  )}
                  <Text
                    style={[
                      styles.uploadButtonText,
                      documentSelections[doc.id] && styles.uploadButtonTextSuccess,
                    ]}
                  >
                    {documentSelections[doc.id] ? 'Change' : 'Upload'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footerText}>
          All information is securely stored and HIPAA-compliant.
        </Text>
      </View>

      <BottomNav />

      <Modal
        visible={showUploadModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseUploadModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseUploadModal}>
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
                  {currentSelection && (
                    <View style={styles.fileInfoRow}>
                      <MaterialIcons
                        name="insert-drive-file"
                        size={18}
                        color={colors.textMuted}
                        style={styles.fileInfoIcon}
                      />
                      <Text style={styles.fileInfoName} numberOfLines={1}>
                        {currentSelection.name}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCloseUploadModal}
                  >
                    <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleConfirmUpload}
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 45,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  instruction: {
    fontSize: 17,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  documentsContainer: {
    marginBottom: 20,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    minHeight: 80,
  },
  iconContainer: {
    marginRight: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  selectedFileName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal:5
  },
  uploadButtonSuccess: {
    backgroundColor: '#ffffff',
    borderColor: colors.primary,
    
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    marginLeft: 8,
  },
  uploadButtonTextSuccess: {
    color: colors.primary,
  },
  checkIcon: {
    width: 15,
    height: 15,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
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
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    maxHeight: 240,
    overflow: 'hidden',
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

