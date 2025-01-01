import { defineService } from '@nzyme/ioc';
import type { FunctionOnly } from '@nzyme/types';
import { formatWith } from '@nzyme/utils';

import { LocaleProvider } from './LocaleProvider.js';
import type { Translatable } from './Translatable.js';
import type { TranslationModule } from './TranslationModule.js';
import { translate } from './utils.js';

export interface Translator {
    (value: Translatable, params?: Record<string, unknown>): string | undefined;

    forModule<TKey extends string>(module: TranslationModule<TKey>): TranslatorForModule<TKey>;
}

export interface TranslatorForModule<TKey extends string> {
    (key: TKey, params?: Record<string, unknown>): string;
    (value: Translatable, params?: Record<string, unknown>): string;
}

export const Translator = defineService({
    name: 'Translator',
    deps: {
        localeProvider: LocaleProvider,
    },
    setup({ localeProvider }): Translator {
        const translator = (<FunctionOnly<Translator>>function (value, params) {
            return translate(value, {
                params,
                locale: localeProvider.locale,
            });
        }) as Translator;

        translator.forModule = <TKey extends string>(module: TranslationModule<TKey>) => {
            return (keyOrTranslatable, params) => {
                const locale = localeProvider.locale;
                const message =
                    typeof keyOrTranslatable === 'string'
                        ? module.get(keyOrTranslatable as TKey, locale) || keyOrTranslatable
                        : keyOrTranslatable(locale);

                if (params) {
                    return formatWith(message, params);
                }

                return message;
            };
        };

        return translator;
    },
});
