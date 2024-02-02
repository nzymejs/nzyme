import type { Translatable } from './Translatable.js';

export type TranslationModuleConfig<TKeys extends string> = Record<
    TKeys,
    Record<string, string | undefined>
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

        const translations = this.translations[key];
        return translations[lang] ?? translations[DEFAULT_LANG] ?? '';
    }
}

export type TranslationKeys<TModule extends TranslationModule<string>> =
    TModule extends TranslationModule<infer TKey> ? TKey : never;
