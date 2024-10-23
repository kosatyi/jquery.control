/**
 * @jest-environment jsdom
 */

window.jQuery = require('jquery')

const { test, expect, describe } = require('@jest/globals')

const {
    createControl,
    initControl,
    initControls,
} = require('../src/core/control')

describe('Control', () => {
    createControl('button', {
        create() {
            this.element.addClass('button')
            this.element.attr('aria-label', 'button')
        },
    })
    test('initControls', () => {
        const element = document.createElement('div')
        element.setAttribute('control', 'button')
        document.body.appendChild(element)
        initControls(document.body)
        expect(element.classList.contains('button')).toBe(true)
    })
})
