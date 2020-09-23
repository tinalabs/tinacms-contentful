import BrowserCookies from 'js-cookie';
import { popupWindow } from '../utils/popup';

export const CONTENTFUL_AUTH_TOKEN = 'TINACMS_CONTENTFUL_USER_AUTH_TOKEN';
export const CONTENTFUL_AUTH_HOSTNAME = 'be.contentful.com';

export async function authenticateWithContentful(
  clientId: string,
  redirectUrl: string
): Promise<string> {
  const url =
    `https://${CONTENTFUL_AUTH_HOSTNAME}` +
    `/oauth/authorize?` +
    `response_type=token&` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUrl}&` +
    `scope=content_management_manage`;
  const popup = popupWindow(url, '_blank', window, 1000, 700);

  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', event => {
        const user_access_token = event?.data?.contentful?.userAccessToken

        if (user_access_token) {
          resolve(user_access_token);
          setCachedAccessToken(user_access_token);
          popup.close();
        }
      });
    }

    window.setInterval(() => {
      if (!popup) {
        reject('Contentful authorization failed');
      }
    });
  });
}

export function getAccessToken(window: Window) {
  const getAccessTokenFromWindow = (window: Window) => {
    if (window.location.host.startsWith(CONTENTFUL_AUTH_HOSTNAME)) {
      return undefined;
    }
  
    const urlParams = new URLSearchParams(window.location.hash);
    const accessToken = urlParams.get('#access_token');
  
    return accessToken === null ? undefined : accessToken;
  }

  if (typeof window !== 'undefined') {
    const userAccessToken = getAccessTokenFromWindow(
      window
    );

    if (!window.opener || !userAccessToken) {
      return;
    }

    const payload = {
      contentful: {
        userAccessToken: userAccessToken,
      },
    };

    window.opener.postMessage(payload, window.opener.location.origin);
  }
}

export function setCachedAccessToken(accessToken: string) {
  BrowserCookies.set(
    CONTENTFUL_AUTH_TOKEN,
    accessToken,
    {
      sameSite: 'strict',
      secure: true
    }
  );
}

export function getCachedUserAccessToken(req: any, res: any) {
  return req?.cookies[CONTENTFUL_AUTH_TOKEN];
}