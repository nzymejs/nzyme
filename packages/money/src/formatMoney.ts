import { CURRENCIES, type Currency } from './Currency.js';
import type { Money } from './Money.js';

export type FormatMoneyOptions = {
    withDecimals?: boolean;
    withCurrency?: boolean;
};

const OPTIONS_DEFAULT: FormatMoneyOptions = {};

export type MoneyFormatter = (
    amount: number | null | undefined,
    options?: FormatMoneyOptions,
) => string;

export function formatMoney(money: Money, options?: FormatMoneyOptions): string {
    return getFormatter(money[1])(money[0], options);
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
    const { locale, fractionDigits, symbol } = CURRENCIES[currency];

    const withDecimalsFormat = new Intl.NumberFormat(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
        useGrouping: 'always',
    });

    const noDecimalsFormat = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: 'always',
    });

    const multiplier = 10 ** fractionDigits;

    return (amount, options = OPTIONS_DEFAULT) => {
        if (amount == null) {
            return '';
        }

        amount = amount / multiplier;

        const withDecimals = options.withDecimals || amount % 1 !== 0;

        let formatted = withDecimals
            ? withDecimalsFormat.format(amount)
            : noDecimalsFormat.format(amount);

        formatted = formatted.replace(/\s/g, '\u00A0');

        const withCurrency = options.withCurrency ?? true;
        if (withCurrency) {
            return `${formatted}\u00A0${symbol}`;
        }

        return formatted;
    };
}

const formatters = new Map<Currency, MoneyFormatter>();
