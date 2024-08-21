import type { Currency } from './Currency.js';
import { CURRENCIES } from './Currency.js';

export function parseMoney(value: string, currency: Currency) {
    const { fractionSymbol, fractionDigits } = CURRENCIES[currency];

    if (fractionSymbol !== '.') {
        value = value.replace(fractionSymbol, '.');
    }

    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
        return null;
    }

    return parsed * 10 ** fractionDigits;
}
