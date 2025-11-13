import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  personalInfo: {
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phoneNumber: '',
    ssn: '',
    referralCode: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    spokenLanguages: [],
    role: '',
    avatar: '',
    mPin: '',
  },
  kyc: {
    documents: {}, // keyed by document id
    isApproved: false, // KYC approval status
    showSuccessModal: false, // Show KYC success modal
  },
  banks: [], // Array of bank accounts
  withdrawals: [], // Array of withdrawal requests
  locationPermissionGranted: false, // Location permission status
  profileCompleted: false, // Profile completion status
  profilePictureTaken: false, // Profile picture taken status
  bookingStates: {}, // Object to store booking states by bookingId: { [bookingId]: 'on_the_way' | 'arrived' | ... }
  incomingBooking: null, // When server pushes a new booking notification
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setPersonalInfo(state, action) {
      state.personalInfo = {
        ...state.personalInfo,
        ...action.payload,
      };
    },
    upsertKycDocument(state, action) {
      const { id, title, number, fileName, uri, type, size, status = 'pending' } = action.payload;
      state.kyc.documents[id] = {
        id,
        title,
        number: number ?? '',
        fileName: fileName ?? '',
        uri: uri ?? '',
        type: type ?? '',
        size: size ?? null,
        status,
        updatedAt: Date.now(),
      };
    },
    removeKycDocument(state, action) {
      const id = action.payload;
      if (state.kyc.documents[id]) {
        delete state.kyc.documents[id];
      }
    },
    setMPin(state, action) {
      state.personalInfo.mPin = action.payload;
    },
    addBankAccount(state, action) {
      const newBank = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: Date.now(),
      };
      state.banks.push(newBank);
    },
    updateBankAccount(state, action) {
      const { id, ...updates } = action.payload;
      const index = state.banks.findIndex((bank) => bank.id === id);
      if (index !== -1) {
        state.banks[index] = { ...state.banks[index], ...updates, updatedAt: Date.now() };
      }
    },
    removeBankAccount(state, action) {
      const id = action.payload;
      state.banks = state.banks.filter((bank) => bank.id !== id);
    },
    addWithdrawal(state, action) {
      const newWithdrawal = {
        id: Date.now().toString(),
        ...action.payload,
        status: 'pending',
        createdAt: Date.now(),
      };
      state.withdrawals.push(newWithdrawal);
    },
    updateWithdrawalStatus(state, action) {
      const { id, status } = action.payload;
      const index = state.withdrawals.findIndex((w) => w.id === id);
      if (index !== -1) {
        state.withdrawals[index].status = status;
        state.withdrawals[index].updatedAt = Date.now();
      }
    },
    setLocationPermission(state, action) {
      state.locationPermissionGranted = action.payload;
    },
    setProfileCompleted(state, action) {
      state.profileCompleted = action.payload;
    },
    setProfilePictureTaken(state, action) {
      state.profilePictureTaken = action.payload;
    },
    setKycApproved(state, action) {
      const wasApproved = state.kyc.isApproved;
      state.kyc.isApproved = action.payload;
      // Show success modal when KYC changes from not approved to approved
      if (!wasApproved && action.payload) {
        state.kyc.showSuccessModal = true;
      }
    },
    setKycSuccessModalVisible(state, action) {
      state.kyc.showSuccessModal = action.payload;
    },
    setBookingState(state, action) {
      const { bookingId, status } = action.payload;
      state.bookingStates[bookingId] = status;
    },
    setIncomingBooking(state, action) {
      state.incomingBooking = action.payload || null; // { id, title? }
    },
    resetProfile() {
      return initialState;
    },
  },
});

export const { setPersonalInfo, upsertKycDocument, removeKycDocument, setMPin, addBankAccount, updateBankAccount, removeBankAccount, addWithdrawal, updateWithdrawalStatus, setLocationPermission, setProfileCompleted, setProfilePictureTaken, setKycApproved, setKycSuccessModalVisible, setBookingState, setIncomingBooking, resetProfile } =
  profileSlice.actions;

export default profileSlice.reducer;

