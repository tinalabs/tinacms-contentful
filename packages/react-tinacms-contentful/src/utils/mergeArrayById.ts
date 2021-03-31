/**
 * Merges two arrays of objects by selecting unique objects by a specific key
 * 
 * @param a1 
 * @param a2 
 * @param key 
 * @returns The merged array
 */
export function mergeArrayByKey(a1: any[], a2: any[], key: string) {
  return a1.map(item => ({
    ...a2.find(item => item[key] === item[key] && item),
    ...item,
  }));
}