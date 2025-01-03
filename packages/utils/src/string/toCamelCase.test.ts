import { expect, test } from 'vitest';

import { toCamelCase, toPascalCase } from './toCamelCase.js';

test('toCamelCase', () => {
    expect(toCamelCase('foo-bar')).toEqual('fooBar');
    expect(toCamelCase('foo-bar-baz')).toEqual('fooBarBaz');
    expect(toCamelCase('foo bar')).toEqual('fooBar');
    expect(toCamelCase('foo bar baz')).toEqual('fooBarBaz');
});

test('toPascalCase', () => {
    expect(toPascalCase('foo-bar')).toEqual('FooBar');
    expect(toPascalCase('foo-bar-baz')).toEqual('FooBarBaz');
    expect(toPascalCase('foo bar')).toEqual('FooBar');
    expect(toPascalCase('foo bar baz')).toEqual('FooBarBaz');
});
