import { resolve, commonjs, babel, terser, copy } from '@kosatyi/rollup'
import pkg from './package.json'

const terserOptions = {
    mangle: {
        reserved: ['$'],
    },
    format: {
        comments: false,
    },
}

export default {
    input: 'src/index.js',
    output: [
        {
            file: pkg.module,
            format: 'esm',
            exports: 'named',
        },
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
        },
        {
            file: pkg.browser,
            name: 'jqctrl',
            format: 'umd',
        },
        {
            file: pkg.minified,
            name: 'jqctrl',
            format: 'umd',
            sourcemap: true,
            plugins: [terser(terserOptions)],
        },
    ],
    plugins: [
        commonjs(),
        resolve({
            browser: true,
        }),
        babel({
            babelHelpers: 'bundled',
        }),
        copy({
            targets: [
                {
                    src: 'package.cjs.json',
                    dest: 'dist/cjs',
                    rename: () => 'package.json',
                },
            ],
            copyOnce: true,
        }),
    ],
}
