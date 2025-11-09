export const KYC_DOCUMENTS = [
  {
    id: 1,
    title: "Driver's License",
    icon: 'id-card-alt',
    iconType: 'FontAwesome5',
  },
  {
    id: 2,
    title: 'Vehicle Registration',
    icon: 'car',
    iconType: 'FontAwesome5',
  },
  {
    id: 3,
    title: 'Proof of Insurance',
    icon: 'shield-check',
    iconType: 'MaterialCommunityIcons',
  },
  {
    id: 4,
    title: 'Profile Photo',
    icon: 'person',
    iconType: 'MaterialIcons',
  },
];

export const KYC_STATUS_META = {
  pending: {
    label: 'Pending',
    icon: require('../assets/img/auth/pending.png'),
    color: '#F4A01E',
  },
  approved: {
    label: 'Approved',
    icon: require('../assets/img/auth/verified.png'),
    color: '#0C403A',
  },
  failed: {
    label: 'Failed',
    icon: require('../assets/img/auth/cancelled.png'),
    color: '#D32F2F',
  },
};

