import { Translatable } from './Translatable.js';

export type TranslationModuleConfig<TKeys extends string> = Record<
    string,
    Record<TKeys, string | undefined> | undefined
>;

const DEFAULT_LANG = 'en';

export class TranslationModule<TKey extends string> {
    constructor(public readonly translations: TranslationModuleConfig<TKey>) {}

    public get(key: TKey, lang: string | null): string;
    public get(key: TKey): Translatable;
    public get(key: TKey, lang?: string | null): Translatable | string {
        if (lang !== undefined) {
            return this.getValue(key, lang);
        } else {
            return lang => this.getValue(key, lang || DEFAULT_LANG);
        }
    }

    public getValue(key: TKey, lang?: string | null) {
        if (!lang) {
            lang = DEFAULT_LANG;
        }

        const translations = this.translations[lang] ?? this.translations[DEFAULT_LANG];
        return translations?.[key] || '';
    }
}

export type TranslationKeys<TModule extends TranslationModule<string>> =
    TModule extends TranslationModule<infer TKey> ? TKey : never;
