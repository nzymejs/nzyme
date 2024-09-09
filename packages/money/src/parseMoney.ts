import type { Currency } from './Currency.js';
import { CURRENCIES } from './Currency.js';
import { normalizeMoney } from './normalizeMoney.js';

export function parseMoney(value: string, currency: Currency) {
    const { fractionSymbol } = CURRENCIES[currency];

    if (fractionSymbol !== '.') {
        value = value.replace(fractionSymbol, '.');
    }

    value = value.replace(/\s*/g, '');

    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
        return null;
    }

    return normalizeMoney(parsed, currency);
}
