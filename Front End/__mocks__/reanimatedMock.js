module.exports = {
  ...require('react-native-reanimated/mock'),
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
  withTiming: jest.fn(),
  withSpring: jest.fn(),
};