const regex = /\s/g;
export function phoneLink(phone: string) {
    return `tel:${phone.replace(regex, '')}`;
}
