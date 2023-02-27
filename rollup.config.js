import {resolve, commonjs, babel, terser} from '@kosatyi/rollup'

export default [{
    input: 'src/index.js',
    output: [
        {
            file: 'dist/jquery.control.js',
            format: 'umd',
            name: 'jQueryControl',
            globals: {
                'jquery': '$'
            },
        },
        {
            file: 'dist/jquery.control.min.js',
            format: 'umd',
            name: 'jQueryControl',
            sourcemap: true,
            globals: {
                'jquery': '$'
            },
            plugins: [
                terser({
                    mangle: {
                        reserved: ['$'],
                    },
                    format: {
                        comments: false,
                    },
                }),
            ]
        }
    ],
    external: ['jquery'],
    plugins: [
        commonjs(),
        resolve({
            browser: true
        }),
        babel({
            babelHelpers: 'bundled'
        }),
    ],
}]
