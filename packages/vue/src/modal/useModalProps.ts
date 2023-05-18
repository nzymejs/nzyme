import { prop } from '../prop.js';
import { ModalHandler } from './ModalTypes.js';

export function useModalProps<T = void>() {
    return {
        modal: prop<ModalHandler<T>>().required(),
    };
}
