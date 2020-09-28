import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { useContentful } from "./useContentful";
import { TinaCMS, TinaProvider } from "tinacms";
import { ContentfulClient } from "tinacms-contentful";
import { TinaContentfulProvider } from "../providers/TinacmsContentfulProvider";
// import '@testing-library/jest-dom/extend-expect';

describe("`useContentful` hook", () => {
  it("should return the contentful client", () => {
    const wrapper: React.FC = ({ children }) => {
      const cms = new TinaCMS({
        enabled: false,
        apis: {
          contentful: new ContentfulClient({
            accessTokens: {
              delivery: "asdf",
              preview: "asdf",
            },
            clientId: "asdf",
            defaultEnvironmentId: "master",
            redirectUrl: "asdf",
            spaceId: "1234",
          }),
        },
      });
      return (
        <TinaProvider cms={cms}>
          <TinaContentfulProvider>{children}</TinaContentfulProvider>
        </TinaProvider>
      );
    };
    const { result } = renderHook(() => useContentful("1234"), {
      wrapper,
    });
    expect(result.current).not.toBeNull();
  });
});
