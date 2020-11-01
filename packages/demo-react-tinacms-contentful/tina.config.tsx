import React from "react";
import Link from 'next/link'
import { DocumentConfig } from 'tinacms-doc-toolkit'

const Config: DocumentConfig = {
  title: 'react-tinacms-contentful',
  pages: [
    { filePath: "1-introduction", label: 'Intro', slug: '/' },
    { filePath: "2-setup", label: "Setup", slug: "/setup" },
    { filePath: "3-fetch-entry", label: "Fetching Entries", slug: "/fetching-your-first-entry" }
  ],
  tinaConfig: {
    enabled: true,
  },
  LinkWrapper: ({to, children})=>{
      return <Link href={`/[...slug]`} as={`${to}`}>{children}</Link>
  },
}

export default Config