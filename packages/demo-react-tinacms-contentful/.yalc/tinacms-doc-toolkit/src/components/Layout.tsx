import React, { useState } from "react";
import { TinaCMS, TinaCMSConfig, TinaProvider } from "tinacms";
import { Container, Columns, Column } from "bloomer";
import { Button } from "bloomer/lib/elements/Button";
import { useLoadComponent } from "../hooks";
import Code from "./Code.js";
import { NavItem } from "./NavItem";
import { CodeBlock } from "./CodeBlock";
import Loader from "./Loader";
import ErrorRenderer from "./ErrorRenderer";

export interface DocumentConfig {
  pages: Page[];
  components: {
    Link: React.FC<{ to: string }>;
    Loading?: React.FC<unknown>;
    RenderError?: React.FC<{ error: Error }>;
  };
  tableOfContentsText?: string;
  cmsToggle?: boolean;
  tinaConfig?: TinaCMSConfig;
}

export interface Page {
  label: string;
  slug: string;
  loadComponent(): Promise<React.FC<unknown>>;
}

export const MDXComponents = {
  pre: (props: any) => <div {...props} />,
  code: CodeBlock,
};

export interface LayoutProps {
  config: DocumentConfig;
  currentSlug: string;
}

export const Layout: React.FC<LayoutProps> = ({ config, currentSlug }) => {
  const { Link, Loading, RenderError } = config.components;
  const [showCode, setVisibility] = useState(false);
  const foundPage = config.pages.find((page) => page.slug === currentSlug);

  if (!foundPage) {
    throw Error(`did not find page with slug ${currentSlug}`);
  }

  const currentPage = foundPage;
  const currentIndex = config.pages.findIndex((page) => page === currentPage);
  const { Component, loading, error } = useLoadComponent(
    currentPage.loadComponent
  );
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pageTinaConfig: TinaCMSConfig = Component.TinaConfig || {};
  const cms = new TinaCMS({
    ...config.tinaConfig,
    ...pageTinaConfig,
  });

  return (
    <>
      {(loading && Loading && <Loading />) || Loader}
      {(error && RenderError && <RenderError error={error} />) || (
        <ErrorRenderer>{error?.message || JSON.stringify(error)}</ErrorRenderer>
      )}
      {Component && (
        <TinaProvider cms={cms}>
          <Container
            style={{
              marginTop: 40,
              marginBottom: 40,
              paddingLeft: 40,
              paddingRight: 40,
              maxWidth: 1000,
            }}
          >
            <Columns>
              <Column isSize="3/4">
                <Component.default />
                <div style={{ marginRight: "0px", marginTop: "40px" }}>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    {config.pages[currentIndex - 1] && (
                      <Link to={config.pages[currentIndex - 1].slug}>
                        <Button type="button" className="button is-small">
                          Previous
                        </Button>
                      </Link>
                    )}
                    {config.cmsToggle && (
                      <Button
                        onClick={cms.toggle}
                        type="button"
                        className="button is-small"
                      >
                        Toggle Edit Mode
                      </Button>
                    )}
                    {Component.code && (
                      <Button
                        type="button"
                        className="button is-small"
                        onClick={() => {
                          setVisibility(!showCode);
                        }}
                      >
                        {showCode ? "Close Code" : "Show Code"}
                      </Button>
                    )}
                    {config.pages[currentIndex + 1] && (
                      <Link to={config.pages[currentIndex + 1].slug}>
                        <Button type="button" className="button is-small">
                          Next
                        </Button>
                      </Link>
                    )}
                  </div>
                  <Code show={showCode}>
                    {typeof Component.code == "undefined"
                      ? ""
                      : Component.code.toString() || ""}
                  </Code>
                </div>
              </Column>

              <Column isSize="1/4">
                {config.tableOfContentsText || "Table of Contents"}
                <ol style={{ marginTop: 20 }}>
                  {config.pages.map((page) => {
                    return (
                      <NavItem
                        active={page.slug === currentPage.slug}
                        key={page.slug}
                      >
                        <Link to={page.slug}>
                          <li>{page.label}</li>
                        </Link>
                      </NavItem>
                    );
                  })}
                </ol>
              </Column>
            </Columns>
          </Container>
        </TinaProvider>
      )}
    </>
  );
};

export default Layout;
