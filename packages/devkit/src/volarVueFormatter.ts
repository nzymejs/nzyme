import { EmbeddedLanguageServicePlugin } from '@volar/vue-language-service-types';
import { html } from 'js-beautify';
import prettier from 'prettier';

export function volarVueFormatter(printWidth: number): EmbeddedLanguageServicePlugin {
    let prettierConfig: prettier.Options | null = null;

    return {
        async format(document, range, options) {
            console.log(document.uri, document.languageId);

            if (!prettierConfig) {
                prettierConfig = (await prettier.resolveConfig(process.cwd())) || {};
            }

            const current = document.getText();
            if (document.languageId === 'html') {
                const formatted = html(current, {
                    wrap_attributes: 'force-aligned',
                });

                if (formatted === current) return [];

                return [
                    {
                        range: {
                            start: document.positionAt(0),
                            end: document.positionAt(document.getText().length),
                        },
                        newText: formatted,
                    },
                ];
            }

            if (document.languageId === 'ts') {
                const formatted = prettier.format(document.getText(), prettierConfig);
                if (formatted === current) return [];

                return [
                    {
                        range: {
                            start: document.positionAt(0),
                            end: document.positionAt(document.getText().length),
                        },
                        newText: formatted,
                    },
                ];
            }
        },
    };
}
