import type { Money } from './Money.js';

export function moneyTimes(money: Money, multiplier: number) {
    return [Math.round(money[0] * multiplier), money[1]];
}

export function moneyDivide(money: Money, divisor: number) {
    return [Math.round(money[0] / divisor), money[1]];
}

export function moneyPlus(money1: Money, money2: Money) {
    if (money1[1] !== money2[1]) {
        throw new Error('Currencies do not match');
    }

    return [money1[0] + money2[0], money1[1]];
}

export function moneyMinus(money1: Money, money2: Money) {
    if (money1[1] !== money2[1]) {
        throw new Error('Currencies do not match');
    }

    return [money1[0] - money2[0], money1[1]];
}
