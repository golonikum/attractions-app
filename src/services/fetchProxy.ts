const useMock = process.env.NODE_ENV === "development";

export const fetchProxy = (url: string, ...args: any[]) => {
  return useMock
    ? fetch(`/mock${url.replace("?", "/")}.json`) // public/mock/api/groups.json
    : fetch(url, ...args);
};
