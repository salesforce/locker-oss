'use strict';

module.exports = {
    collectCoverage: true,
    coverageDirectory: 'jest-coverage/json/',
    coverageReporters: ['json'],
    moduleNameMapper: {
        '^@locker/(near-membrane-\\w+)$': '<rootDir>/packages/$1/src',
    },
    roots: [
        '<rootDir>/packages/babel-plugin-transform-unforgeables',
        '<rootDir>/packages/babel-transform-window-top-location',
    ],
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost/',
    },
    verbose: true,
};
