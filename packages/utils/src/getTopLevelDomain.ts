export function getTopLevelDomain(domain: string) {
    const topLevelDomainRegex = /(.*\.)?([\w_-]*\.[\w]*)/;
    const topLevelDomainMatch = topLevelDomainRegex.exec(domain);
    if (!topLevelDomainMatch) {
        return null;
    }

    return topLevelDomainMatch[2];
}
