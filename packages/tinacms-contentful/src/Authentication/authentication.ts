import { openOauthWindow, onBearerToken } from './oauth';

export async function authenticateWithContentful(
  clientId: string,
  redirectUrl: string,
  allowedOrigins: string[],
  authWindow?: Window
): Promise<string> {
  const popup = authWindow ?? openOauthWindow(clientId, redirectUrl);

  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      onBearerToken(allowedOrigins)
        .then(token => resolve(token))
        .catch(error => reject(error.message))
        .finally(() => popup.close());
      
      let interval = window.setInterval(() => {
        if (!popup) {
          reject('Contentful authorization failed');
          window.clearInterval(interval);
        }
      });
    }
  });
}