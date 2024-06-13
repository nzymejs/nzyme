import type { Money } from './Money.js';

export function PLN(amount: number): Money {
    return [amount, 'PLN'];
}

export function USD(amount: number): Money {
    return [amount, 'USD'];
}

export function EUR(amount: number): Money {
    return [amount, 'EUR'];
}
