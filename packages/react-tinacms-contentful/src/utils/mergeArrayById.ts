export function mergeArrayById(a1: any[], a2: any[]) {
  return a1.map(item => ({
    ...a2.find(item => item.id === item.id && item),
    ...item,
  }));
}