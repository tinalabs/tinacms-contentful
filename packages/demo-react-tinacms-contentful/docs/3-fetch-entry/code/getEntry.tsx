import React from "react";
import { useContentfulEntry } from "react-tinacms-contentful";

const ENTRY_ID = "abc123"

export function GetEntry(props: any) {
  const [entry, loading, error] = useContentfulEntry(ENTRY_ID);

  return (
    <main>
      {process.env.CONTENTFUL_CLIENT_ID}
      {entry && JSON.stringify(entry)}
      {loading && "Loading..."}
      {error && error.message}
    </main>
  )
}

export default GetEntry;