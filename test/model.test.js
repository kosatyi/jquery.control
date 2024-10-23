/**
 * @jest-environment jsdom
 */

window.jQuery = require('jquery')

const { test, expect, describe } = require('@jest/globals')

const { createModel, getModel } = require('../src/core/model')

describe('Model', () => {
    createModel('api', {})
    const PlainObject = {}

    test('Model.attr(name)', () => {
        const model = getModel('api', {
            objectValue: PlainObject,
            stringValue: 'string',
            nullValue: null,
        })
        expect(model.attr('nullValue')).toBe(null)
        expect(model.attr('nullValue.test')).toBe(undefined)
        expect(model.attr('stringValue')).toBe('string')
        expect(model.attr('objectValue')).toBe(PlainObject)
        model.attr('nullValue.test', 'drive')
    })
    test('Model.attr(name,value)', () => {
        const model = getModel('api', {
            objectValue: PlainObject,
            stringValue: 'string',
            nullValue: null,
        })
        expect(model.attr('nullValue')).toBe(null)
        model.attr('nullValue.child', 'value')
        expect(model.attr('nullValue.child')).toBe('value')
        model.attr('nullValue.child.test', 'value')
        expect(model.attr('nullValue.child.test')).toBe('value')
        model.attr('nullValue.child.test.drive', 'value')
        expect(model.attr('nullValue.child.test.drive')).toBe('value')
    })
})
