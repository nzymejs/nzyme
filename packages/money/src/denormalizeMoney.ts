import { CURRENCIES, type Currency } from './Currency.js';

export function denormalizeMoney(value: number | null, currency: Currency) {
    if (value == null) {
        return null;
    }

    return value / 10 ** CURRENCIES[currency].fractionDigits;
}
