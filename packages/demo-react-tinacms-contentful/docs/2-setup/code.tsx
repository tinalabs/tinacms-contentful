import React, { useMemo } from "react";
import { TinaCMS, TinaProvider } from "tinacms";
import { ContentfulClient, TinaContentfulProvider } from "react-tinacms-contentful";

export const CmsProvider = (props: any) => {
  const cms = useMemo(() => new TinaCMS({
    enabled: true,
    apis: {
      contentful: new ContentfulClient({
        clientId: process.env.CONTENTFUL_OAUTH_CLIENT_ID as string,
        spaceId: process.env.CONTENTFUL_SPACE_ID as string,
        defaultEnvironmentId: "master",
        accessTokens: {
          delivery: process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN as string,
          preview: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN as string
        },
        redirectUrl: "/authorize"
      })
    }
  }), []);

  return (
    <TinaProvider cms={cms}>
      <TinaContentfulProvider
        onLogin={() => cms.enable()}
        onLogout={() => cms.disable()}
      >
        {props.children}
      </TinaContentfulProvider>
    </TinaProvider>
  );
}

export default CmsProvider;