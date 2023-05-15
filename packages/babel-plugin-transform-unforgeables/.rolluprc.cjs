'use strict';

const fs = require('fs-extra');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { rollupConfig } = require('scripts/rollup/configs/next.cjs');

const packageJSON = fs.readJSONSync('package.json');

module.exports = rollupConfig({
    copyrightYear: '2023',
    external: /node_modules/,
    output: {
        exports: 'default',
    },
});
