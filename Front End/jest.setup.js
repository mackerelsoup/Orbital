jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-constants', () => ({
  manifest: {},
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    PanGestureHandler: View,
    BaseButton: View,
    Directions: {
      RIGHT: 1,
      LEFT: 2,
      UP: 3,
      DOWN: 4,
    },
    State: {
      BEGAN: 'BEGAN',
      FAILED: 'FAILED',
      ACTIVE: 'ACTIVE',
      END: 'END',
    },
  };
});

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const RealComponent = jest.requireActual('react-native-paper');
  return {
    ...RealComponent,
    RadioButton: 'RadioButton',
    Provider: ({ children }) => children,
  };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));