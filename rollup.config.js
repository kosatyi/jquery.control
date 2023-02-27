import {resolve, commonjs, babel, terser} from '@kosatyi/rollup'

export default [{
    input: 'src/index.js',
    output: [
        {
            file: 'dist/jquery.control.js',
            format: 'umd',
            name: '$',
            globals: {
                'jquery': '$',
            },
        },
        {
            file: 'dist/jquery.control.min.js',
            format: 'umd',
            name: '$',
            sourcemap: true,
            globals: {
                'jquery': '$',
                'document': 'document',
                'window': 'window'
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
