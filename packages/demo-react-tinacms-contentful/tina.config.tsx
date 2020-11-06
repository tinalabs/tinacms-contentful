import React from 'react';
import Link from 'next/link';
import { DocumentConfig } from 'tinacms-doc-toolkit';
import Intro from "./docs/1-introduction";
import Setup from "./docs/2-setup";
import FetchEntries from "./docs/3-fetch-entry";

const Config: DocumentConfig = {
  pages: [
    {
      loadComponent: Intro,
      label: 'Intro',
      slug: '/',
    },
    {
      loadComponent: Setup,
      label: 'Setup',
      slug: '/setup',
    },
    {
      loadComponent: FetchEntries,
      label: 'Fetching Entries',
      slug: '/fetching-your-first-entry',
    },
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
  },
};

export default Config;
