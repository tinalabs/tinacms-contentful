import React from 'react'
import Link from "next/link";
import { Config  } from "tinacms-doc-toolkit";


export const DemoConfig: Config = {
  pages: [
    {
      label: "Introduction",
      slug: "/",
      loadPage: import("./content/introduction.mdx"),
    },
    {
      label: "Getting Started",
      slug: "/getting-started",
      loadPage: import("./content/getting-started.mdx")
    },
    {
      label: "Fetching Entries",
      slug: "/fetching-entries",
      loadPage: import("./content/fetching-entries.mdx")
    },
    {
      label: "Editing Entries",
      slug: "/editing-entries",
      loadPage: import("./content/editing-entries.mdx")
    },
    {
      label: "Using in Plugins",
      slug: "/plugins",
      loadPage: import("./content/plugins.mdx")
    }
  ],
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
