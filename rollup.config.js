import {resolve, commonjs, babel, terser} from '@kosatyi/rollup'

export default [{
    input: 'src/index.js',
    output: [
        {
            file: 'dist/jquery.control.js',
            format: 'cjs',
            name: '$',
            globals: {
                'jquery': '$'
            },
        },
        {
            file: 'dist/jquery.control.min.js',
            format: 'umd',
            name: '$',
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
        resolve(),
        babel({
            babelHelpers: 'bundled',
            sourceMaps: true
        }),
    ],
}]
