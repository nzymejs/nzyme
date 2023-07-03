import { BooleanSchema } from '@nzyme/schema';

test('default value - zero by default', () => {
    const schema = new BooleanSchema();

    expect(schema.defaultValue()).toBe(false);
});

test('default value - custom constant', () => {
    const schema = new BooleanSchema({
        default: true,
    });

    expect(schema.defaultValue()).toBe(true);
});

test('default value - custom function', () => {
    const schema = new BooleanSchema({
        default: () => true,
    });

    expect(schema.defaultValue()).toBe(true);
});
