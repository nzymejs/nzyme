import { getClassMarker } from '@nzyme/utils';

test('gets same marker for the same class', () => {
    class Foo {}

    const symbol = Symbol();
    const marker1 = getClassMarker(Foo, symbol);
    const marker2 = getClassMarker(Foo, symbol);

    expect(typeof marker1).toBe('symbol');
    expect(marker1).toBe(marker2);
});

test('gets different marker for different classes', () => {
    class Foo {}
    class Bar {}

    const symbol = Symbol();
    const markerFoo = getClassMarker(Foo, symbol);
    const markerBar = getClassMarker(Bar, symbol);

    expect(typeof markerFoo).toBe('symbol');
    expect(typeof markerBar).toBe('symbol');
    expect(markerFoo).not.toBe(markerBar);
});

test('gets different marker for inherited classes', () => {
    class Foo {}
    class Bar extends Foo {}

    const symbol = Symbol();
    const markerFoo = getClassMarker(Foo, symbol);
    const markerBar = getClassMarker(Bar, symbol);

    expect(typeof markerFoo).toBe('symbol');
    expect(typeof markerBar).toBe('symbol');
    expect(markerFoo).not.toBe(markerBar);
});
