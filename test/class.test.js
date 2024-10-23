/**
 * @jest-environment jsdom
 */

window.jQuery = require('jquery')

const { test, expect, describe } = require('@jest/globals')

const { createClass, getClass } = require('../src/core/class')

describe('Class', () => {
    createClass('test', {
        getValue() {
            return 'value'
        },
    })
    test('Class', () => {
        const instance = getClass('test')
        expect(instance.getValue()).toBe('value')
    })
})
