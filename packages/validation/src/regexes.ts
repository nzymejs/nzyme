export const EMAIL_REGEX =
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export const URL_REGEX =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

export const FILENAME_REGEX = /^[^<>:;,?"*|/]+$/;
