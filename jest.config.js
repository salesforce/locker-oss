'use strict';

module.exports = {
    collectCoverage: true,
    coverageDirectory: 'jest-coverage/json/',
    coverageReporters: ['json'],
    moduleNameMapper: {
        '^@locker/(\\w+)$': '<rootDir>/packages/$1/src',
    },
    roots: ['<rootDir>/packages/babel-plugin-transform-unforgeables'],
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost/',
    },
    verbose: true,
};
