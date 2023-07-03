import { TranslationModule } from '@nzyme/i18n';

import en from './en.json' assert { type: 'json' };
import pl from './pl.json' assert { type: 'json' };

export default new TranslationModule({
    en,
    pl,
});
