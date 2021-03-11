import Cookies from "js-cookie";
import { popupWindow } from './popup';

export const CONTENTFUL_AUTH_TOKEN = 'TINACMS_CONTENTFUL_USER_AUTH_TOKEN';
export const CONTENTFUL_AUTH_HOSTNAME = 'be.contentful.com';

export function openOauthWindow(clientId: string, redirectUrl: string) {
  const url =
    `https://${CONTENTFUL_AUTH_HOSTNAME}` +
    `/oauth/authorize?` +
    `response_type=token&` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUrl}&` +
    `scope=content_management_manage`;
  const auth_window = popupWindow(url, '_blank', window, 1000, 700);

  return auth_window;
}

export function onBearerToken(allowedOrigins?: string[]): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      let listener = (event: MessageEvent) => {
        const bearer_token = event?.data?.contentful?.bearerToken

        if (bearer_token && allowedOrigins?.includes(event.origin)) {
          resolve(bearer_token);
          window.removeEventListener('message', listener);
        }
      }

      window.addEventListener('message', listener)
    }
  });
}

export function getBearerToken(window: Window, allowedOrigins?: string[]) {
  const allowed_origins = allowedOrigins ?? [];
  const getAccessTokenFromWindow = (window: Window, allowedOrigins: string[]) => {
    if (allowedOrigins.includes(window.origin)) {
      const urlParams = new URLSearchParams(window.location.hash);
      const accessToken = urlParams.get('#access_token');
    
      return accessToken === null ? undefined : accessToken;
    }

    return;
  }

  if (!allowed_origins.includes(window.opener.location.origin)) {
    allowed_origins.push(window.opener.location.origin);
  }

  if (typeof window !== 'undefined') {
    const userAccessToken = getAccessTokenFromWindow(
      window,
      allowed_origins
    );

    if (!window.opener || !userAccessToken) {
      return;
    }

    const payload = {
      contentful: {
        bearerToken: userAccessToken,
      },
    };

    allowed_origins.forEach(origin => {
      window.opener.postMessage(payload, origin);
    })
  }
}

export function setCachedBearerToken(bearerToken: string, secure: boolean = false) {
  if (typeof window !== "undefined") {
    Cookies.set(CONTENTFUL_AUTH_TOKEN, bearerToken, {
      expires: 60 * 60,
      secure: true,
      sameSite: 'strict',
      ['http-only']: secure
    });
  }
}

export function getCachedBearerToken() {
  if (typeof window !== "undefined") {
    return Cookies.get(CONTENTFUL_AUTH_TOKEN);
  }

  return;
}