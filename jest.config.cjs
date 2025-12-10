/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',

  // Transform TS/JS/TSX/JSX using babel-jest
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  moduleNameMapper: {
    // CSS modules / styles
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    // Static assets
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/test/__mocks__/fileMock.js',
    // Your path aliases from tsconfig (adjust to match)
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], // if you use RTL config
};
