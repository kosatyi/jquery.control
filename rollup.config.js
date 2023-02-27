import {resolve, commonjs, babel, terser} from '@kosatyi/rollup'
import sourcemaps from 'rollup-plugin-sourcemaps';

const terserConfig = {
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
            file: 'dist/jquery.control.js',
            format: 'umd',
            name: '$',
            globals: {
                jquery: '$',
            },
            plugins: [
                commonjs(),
                resolve(),
                babel({
                    babelHelpers: 'bundled',
                }),
            ]
        },
        {
            file: 'dist/jquery.control.min.js',
            sourcemap: true,
            format: 'umd',
            name: '$',
            globals: {
                jquery: '$',
            },
            plugins: [
                sourcemaps(),
                commonjs(),
                resolve(),
                babel({
                    babelHelpers: 'bundled',
                }),
                terser(terserConfig),
            ]
        }
    ],
    external: ['jquery'],
}
