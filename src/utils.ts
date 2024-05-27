export const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (_key: any, value: object | null) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export const getUrlWithParams = (url: string, token: string): string => {
  if (token) {
    const urlFull = new URL(url);
    urlFull.searchParams.append('token', token);
    console.log(`open ${urlFull.toString()}`);
    return urlFull.toString();
  }
  return url;
};
