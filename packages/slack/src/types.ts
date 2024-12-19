import type { KnownBlock } from '@slack/web-api';

export type SlackText = (string | undefined | null | false)[] | string;
export type SlackBlock = KnownBlock;
