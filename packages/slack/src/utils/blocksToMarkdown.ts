import type { Block, KnownBlock } from '@slack/web-api';

import { mapNotNull } from '@nzyme/utils';

export function blocksToMarkdown(blocks: (KnownBlock | Block)[]): string {
    return mapNotNull(blocks as KnownBlock[], blockToMarkdown).join('\n\n');
}

export function blockToMarkdown(block: KnownBlock): string | undefined {
    switch (block.type) {
        case 'section': {
            let text = block.text?.text ?? '';

            if (block.fields) {
                text += '\n' + block.fields.map(field => field.text).join('\n');
            }

            return text;
        }
        case 'header':
            return `# ${block.text?.text ?? ''}`;
        case 'divider':
            return '---';
        case 'image': {
            const title = block.title?.text ?? block.alt_text;

            if ('image_url' in block) {
                return `![${title}](${block.image_url})`;
            }

            if ('slack_file' in block && 'url' in block.slack_file) {
                return `![${title}](${block.slack_file.url})`;
            }
        }
    }
}
