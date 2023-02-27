import {resolve, commonjs, babel, terser} from '@kosatyi/rollup'
import sourcemaps from "rollup-plugin-sourcemaps";


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
            sourcemaps: true,
            file: 'dist/jquery.control.js',
            format: 'umd',
            name: '$',
            globals: {
                jquery: '$',
            },
        },
        {
            sourcemaps: true,
            file: 'dist/jquery.control.min.js',
            format: 'umd',
            name: '$',
            globals: {
                jquery: '$',
            },
            plugins: [
                terser(terserConfig),
            ]
        }
    ],
    external: ['jquery'],
    plugins: [
        sourcemaps(),
        commonjs(),
        resolve(),
        babel({
            babelHelpers: 'bundled',
        }),
    ],
}
