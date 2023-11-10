import { type ModalHandler } from './ModalTypes.js';
import { prop } from '../prop.js';

export function useModalProps<T = void>() {
    return {
        modal: prop<ModalHandler<T>>().required(),
    };
}
