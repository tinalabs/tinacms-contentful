import React from "react";
import { TinaCMSConfig } from "tinacms";
export interface DocumentConfig {
    pages: Page[];
    components: {
        Link: React.FC<{
            to: string;
        }>;
        Loading?: React.FC<unknown>;
        RenderError?: React.FC<{
            error: Error;
        }>;
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
export declare const MDXComponents: {
    pre: (props: any) => JSX.Element;
    code: ({ children, className }: any) => JSX.Element;
};
export interface LayoutProps {
    config: DocumentConfig;
    currentSlug: string;
}
export declare const Layout: React.FC<LayoutProps>;
export default Layout;
