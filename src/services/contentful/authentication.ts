import Cookies from 'js-cookie';
import usePopupWindow from '../../hooks/usePopupWindow';

export class ContentfulAuthenticationService {
  private static CONTENTFUL_AUTH_TOKEN = "TINACMS_CONTENTFUL_USER_AUTH_TOKEN";

  public static async Authenticate(clientId: string, redirectUrl: string) {
    return new Promise(resolve => {
      const url = 
          `https://be.contentful.com/oauth/authorize?`
        + `response_type=token&`
        + `client_id=${clientId}&`
        + `redirect_uri=${redirectUrl}&`
        + `scope=content_management_manage`;
      const popupWindow = usePopupWindow([url, '_blank', window, 1000, 700]);

      // Poll for the access token in the window
      // TODO: see if this can move to event driven architecture
      window.setTimeout(() => {
        if (popupWindow) {
          const accessToken = ContentfulAuthenticationService.GetAccessTokenFromWindow(popupWindow);

          if (accessToken) {
            // Add access token via HTTP-Only cookie to allow proxy-based auth
            Cookies.set(ContentfulAuthenticationService.CONTENTFUL_AUTH_TOKEN, accessToken, {
              sameSite: 'strict'
            });
          }

          popupWindow.close();
          resolve();
        }
      }, 1000 * 1);
    });
  }

  public static GetAccessTokenFromWindow(window: Window) {
    const urlParams = new URLSearchParams(window.location.hash);
    const accessToken = urlParams.get("#access_token");

    return accessToken;
  }
}