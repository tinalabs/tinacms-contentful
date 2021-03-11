export function mergeArrayByKey(a1: any[], a2: any[], key: string) {
  return a1.map(item => ({
    ...a2.find(item => item[key] === item[key] && item),
    ...item,
  }));
}