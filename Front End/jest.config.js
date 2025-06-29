module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    './jest.setup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-navigation|@react-navigation/.*|react-native-reanimated|react-native-gesture-handler|react-native-paper|@expo/vector-icons|expo-router|expo-font|expo-modules-core))',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/reanimatedMock.js',
    '^react-native-gesture-handler$': '<rootDir>/__mocks__/gestureHandlerMock.js',
    '^react-native-paper$': '<rootDir>/__mocks__/reactNativePaperMock.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/vectorIconsMock.js',
    '^expo-router$': '<rootDir>/__mocks__/expoRouterMock.js',
  },
  testEnvironment: 'jsdom',
};