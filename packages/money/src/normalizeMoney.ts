import { CURRENCIES, type Currency } from './Currency.js';

export function normalizeMoney(value: number | null, currency: Currency) {
    if (value == null) {
        return null;
    }

    return Math.round(value * 10 ** CURRENCIES[currency].fractionDigits);
}
