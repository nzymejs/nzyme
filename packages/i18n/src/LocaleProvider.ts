import { defineInterface } from '@nzyme/ioc';

export interface LocaleProvider {
    locale: string;
}

export const LocaleProvider = defineInterface<LocaleProvider>({
    name: 'LocaleProvider',
});
