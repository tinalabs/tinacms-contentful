/**
 * Debounces a function, watching to see the last time it was called,
 * and forcing the logic to wait until the wait timeout has passed to
 * call it again.
 * 
 * @param func The logic to run after debouncing has ended
 * @param wait Time to wait to run in milliseconds
 * @param immediate Whether to short-circuit debouncing and run the logic immediately
 */
export function debounce(func: (...args: any[]) => Promise<void>, wait: number, immediate: boolean) {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function executedFunction(this: unknown) {
    const context = this;
    const args = Array.from(arguments);
    const callNow = immediate && !timeout;
    const callback = () => func.apply<unknown, any[], Promise<void>>(context, args);
    const later = async function() {
      timeout = null;
      
      if (!immediate) await callback();
    };
	
    if (callNow) {
      return new Promise(async (resolve, reject) => {
        try {
          await callback();

          resolve(undefined);
        } catch (error) {
          reject(error)
        }
      })
    }
    else if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
};