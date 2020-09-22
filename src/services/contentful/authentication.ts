import Cookies from 'js-cookie';
import { popupWindow } from '../../hooks/usePopupWindow';

export class ContentfulAuthenticationService {
  public static CONTENTFUL_AUTH_TOKEN = 'TINACMS_CONTENTFUL_USER_AUTH_TOKEN';
  public static CONTENTFUL_AUTH_HOSTNAME = 'be.contentful.com';

  public static async authenticate(
    clientId: string,
    redirectUrl: string
  ): Promise<string> {
    const url =
      `https://be.contentful.com/oauth/authorize?` +
      `response_type=token&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUrl}&` +
      `scope=content_management_manage`;
    const popup = popupWindow(url, '_blank', window, 1000, 700);

    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined') {
        window.addEventListener('message', event => {
          if (event.data.contentful.userAccessToken) {
            resolve(event.data.contentful.userAccessToken);
            popup.close();
          }
        });
      }

      window.setInterval(() => {
        if (!popup) {
          reject('Auth failed');
        }
      });
    });
  }

  public static waitAndEmitAccessToken(window: Window) {
    if (typeof window !== 'undefined') {
      const userAccessToken = ContentfulAuthenticationService.getAccessTokenFromWindow(
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

  public static getAccessTokenFromWindow(window: Window) {
    if (
      window.location.host.startsWith(
        ContentfulAuthenticationService.CONTENTFUL_AUTH_HOSTNAME
      )
    ) {
      return undefined;
    }

    const urlParams = new URLSearchParams(window.location.hash);
    const accessToken = urlParams.get('#access_token');

    return accessToken === null ? undefined : accessToken;
  }

  public static setCachedAccessToken(accessToken: string) {
    Cookies.set(
      ContentfulAuthenticationService.CONTENTFUL_AUTH_TOKEN,
      accessToken,
      {
        sameSite: 'strict',
        secure: true,
      }
    );
  }

  public static getCachedAccessToken() {
    return Cookies.get(ContentfulAuthenticationService.CONTENTFUL_AUTH_TOKEN);
  }
}
