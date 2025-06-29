const React = require('react');

module.exports = {
  BottomSheetModal: ({ children }) => children,
  BottomSheetModalProvider: ({ children }) => children,
  BottomSheetBackdrop: 'BottomSheetBackdrop',
  BottomSheetHandle: 'BottomSheetHandle',
  useBottomSheetModal: () => ({
    dismiss: jest.fn(),
    present: jest.fn(),
  }),
};