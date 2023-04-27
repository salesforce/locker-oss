'use strict';

const commonjsPlugin = require('@rollup/plugin-commonjs');
const fs = require('fs-extra');
const mergeOptions = require('merge-options');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const path = require('node:path');
const typescriptPlugin = require('rollup-plugin-ts');

const mergeOptionsConfig = {
    concatArrays: true,
    ignoreUndefined: true,
};

function createConfig({ format = 'cjs', ...rollupOverrides } = {}) {
    const isCJS = format === 'cjs';
    const inputPath = 'src/index.ts';
    const outputPath = `dist/index${isCJS ? '.cjs' : '.mjs'}.js`;
    const packageJSONPath = 'package.json';

    const packageJSON = fs.readJSONSync(packageJSONPath);
    const { dependencies } = packageJSON;

    const mergedRollupOptions = mergeOptions.call(
        mergeOptionsConfig,
        {
            external: undefined,
            input: inputPath,
            output: {
                file: outputPath,
                format,
            },
            plugins: undefined,
        },
        rollupOverrides
    );

    if (!mergedRollupOptions.external && dependencies) {
        mergedRollupOptions.external = Object.keys(dependencies);
    }
    if (!Array.isArray(mergedRollupOptions.plugins)) {
        mergedRollupOptions.plugins = [];
    }
    const { plugins } = mergedRollupOptions;
    if (!plugins.find((plugin) => plugin?.name === 'node-resolve')) {
        plugins.unshift(
            nodeResolve({
                preferBuiltins: true,
            })
        );
    }
    if (!plugins.find((plugin) => plugin?.name === 'commonjs')) {
        plugins.unshift(
            commonjsPlugin({
                requireReturnsDefault: 'namespace',
            })
        );
    }
    if (
        path.extname(mergedRollupOptions.input) === '.ts' &&
        !plugins.find((plugin) => plugin?.name === 'typescript')
    ) {
        plugins.unshift(typescriptPlugin());
    }

    return mergedRollupOptions;
}

module.exports = {
    rollupConfig(providedOptions) {
        return [
            createConfig({ ...providedOptions, format: 'es' }),
            createConfig({ ...providedOptions, format: 'cjs' }),
        ];
    },
};
