import { defineContext } from '@nzyme/vue-utils';

import type { ModalHandler } from './ModalTypes.js';

export const ModalContext = defineContext<ModalHandler>('Modal');
