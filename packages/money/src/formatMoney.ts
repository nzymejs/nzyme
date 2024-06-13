import type { Currency } from './Currency.js';
import type { Money } from './Money.js';

export type FormatMoneyOptions = {
    decimals?: boolean;
};

export function formatMoney(money: Money, options?: FormatMoneyOptions): string {
    const amount = money[0] / 100;

    let decimals = options?.decimals;
    if (!decimals && amount % 1 !== 0) {
        decimals = true;
    }

    const formatter = getFormatter(money[1]);
    return decimals ? formatter.withDecimals.format(amount) : formatter.noDecimals.format(amount);
}

function getFormatter(currency: Currency) {
    let formatter = formatters.get(currency);
    if (!formatter) {
        formatter = createFormatter(currency);
        formatters.set(currency, formatter);
    }

    return formatter;
}

function createFormatter(currency: Currency): MoneyFormatter {
    return {
        withDecimals: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        } as Intl.NumberFormatOptions),
        noDecimals: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        } as Intl.NumberFormatOptions),
    };
}

type MoneyFormatter = {
    withDecimals: Intl.NumberFormat;
    noDecimals: Intl.NumberFormat;
};

const formatters = new Map<Currency, MoneyFormatter>();
