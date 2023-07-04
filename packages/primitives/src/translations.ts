import { TranslationModule } from '@nzyme/i18n';

import translations from './translations.json' assert { type: 'json' };

export default new TranslationModule(translations);
