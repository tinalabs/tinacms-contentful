import { useState } from 'react';

export function useContentfulUserAuthToken(): [string | undefined] {
  const [userAccessToken, setUserAccessToken] = useState<string>();

  if (typeof window !== 'undefined') {
    window.addEventListener('message', event => {
      if (event.data.contentful.userAccessToken)
      {
        setUserAccessToken(event.data.contentful.userAccessToken);
      }
    });
  }

  return [userAccessToken];
}