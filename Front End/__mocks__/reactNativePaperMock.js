const React = require('react');
const RealComponent = require.requireActual('react-native-paper');

module.exports = {
  ...RealComponent,
  RadioButton: {
    Group: ({ children }) => children,
    Item: 'RadioButton',
  },
  Provider: ({ children }) => children,
};