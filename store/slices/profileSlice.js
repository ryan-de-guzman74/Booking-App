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
  },
  banks: [], // Array of bank accounts
  withdrawals: [], // Array of withdrawal requests
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
    resetProfile() {
      return initialState;
    },
  },
});

export const { setPersonalInfo, upsertKycDocument, removeKycDocument, setMPin, addBankAccount, updateBankAccount, removeBankAccount, addWithdrawal, updateWithdrawalStatus, resetProfile } =
  profileSlice.actions;

export default profileSlice.reducer;

