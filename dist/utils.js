export const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};
export const getUrlWithParams = (url, token) => {
    if (token) {
        const urlFull = new URL(url);
        urlFull.searchParams.append('token', token);
        console.log(`open ${urlFull.toString()}`);
        return urlFull.toString();
    }
    return url;
};
