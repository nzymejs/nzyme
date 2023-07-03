import { defineInjectable } from '@nzyme/ioc';

export interface LocaleProvider {
    locale: string;
}

export const LocaleProvider = defineInjectable<LocaleProvider>({
    name: 'LocaleProvider',
});
