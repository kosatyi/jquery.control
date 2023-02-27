import {resolve, commonjs, babel, terser} from '@kosatyi/rollup'
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
            file: pkg.main,
            name: pkg.name,
            format: 'umd',
        },
        {
            file: pkg.browser,
            name: pkg.name,
            format: 'umd',
            sourcemap: true,
            plugins: [
                terser(terserOptions),
            ]
        }
    ],
    plugins: [
        commonjs(),
        resolve(),
        babel({
            babelHelpers: 'bundled'
        }),
    ],
}
