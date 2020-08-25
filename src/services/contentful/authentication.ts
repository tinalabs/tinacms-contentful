import Cookies from 'js-cookie';
import usePopupWindow from '../../hooks/usePopupWindow';

export class ContentfulAuthenticationService {
  public static CONTENTFUL_AUTH_TOKEN = "TINACMS_CONTENTFUL_USER_AUTH_TOKEN";
  public static CONTENTFUL_AUTH_HOSTNAME = "be.contentful.com";

  public static async authenticate(clientId: string, redirectUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = 
          `https://be.contentful.com/oauth/authorize?`
        + `response_type=token&`
        + `client_id=${clientId}&`
        + `redirect_uri=${redirectUrl}&`
        + `scope=content_management_manage`;
      const popupWindow = usePopupWindow([url, '_blank', window, 1000, 700]);

      // Poll for the access token in the window
      // TODO: see if this can move to event driven architecture
      const interval = window.setInterval(() => {
        if (popupWindow && popupWindow.location.href.startsWith(redirectUrl)) {
          const accessToken = ContentfulAuthenticationService.getAccessTokenFromWindow(popupWindow);

          if (accessToken) {
            resolve(accessToken);
            window.clearInterval(interval);
            popupWindow.close();
          }
          else {
            reject("No user token found")
          }
        }
      }, 1000 * 1);
    });
  }

  public static getAccessTokenFromWindow(window: Window) {
    if (window.location.host.startsWith(ContentfulAuthenticationService.CONTENTFUL_AUTH_HOSTNAME)) {
      return undefined;
    }

    const urlParams = new URLSearchParams(window.location.hash);
    const accessToken = urlParams.get("#access_token");

    return accessToken === null ? undefined : accessToken;
  }

  public static setCachedAccessToken(accessToken: string) {            
    Cookies.set(ContentfulAuthenticationService.CONTENTFUL_AUTH_TOKEN, accessToken, {
      sameSite: 'strict',
      secure: true
    });
  }

  public static getCachedAccessToken() {
    return Cookies.get(ContentfulAuthenticationService.CONTENTFUL_AUTH_TOKEN)
  }
}