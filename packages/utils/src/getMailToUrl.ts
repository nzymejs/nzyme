type MailToOptions = {
    subject?: string;
    body?: string;
    cc?: string;
    bcc?: string;
};

export function getMailToUrl(email: string, options: MailToOptions = {}) {
    const url = new URL(`mailto:${email}`);

    if (options.subject) {
        url.searchParams.set('subject', options.subject);
    }

    if (options.cc) {
        url.searchParams.set('cc', options.cc);
    }

    if (options.bcc) {
        url.searchParams.set('bcc', options.bcc);
    }

    if (options.body) {
        url.searchParams.set('body', options.body);
    }

    return url.toString();
}
