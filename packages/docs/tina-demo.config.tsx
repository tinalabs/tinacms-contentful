import React from 'react'
import Link from "next/link";
import { Config } from "tinacms-doc-toolkit";

const PAGE_PATHS: string[] = Array.isArray(process.env.pagePaths) ? process.env.pagePaths : [];

export const DemoConfig: Config = {
  pages: PAGE_PATHS.map(pagePath => {
    const slug = pagePath.replace(/(index)$/, '')
    const name = slug
      .replace(/^\/\d-|^\//, '') // Remove leading slash and number
      .replace(/[\-_]/, " ")
      .replace(/^([a-z])/, value => value.toUpperCase()) // Capitalize
      .replace(/[ ]([a-z])/, (_value, match) => ` ${match.toUpperCase()}`) // Title case
    const label = name.length > 0 ? name : "Introduction"
    const loadPage = import("./content" + pagePath + ".mdx");
 
    return {
      label,
      slug,
      loadPage
    }
  }),
  tinaConfig: {
    enabled: true,
  },
  components: {
    Link: ({ to, children }) => (
      <Link href={`/[...slug]`} as={`${to}`}>
        {children}
      </Link>
    ),
  }
};

export default DemoConfig;
