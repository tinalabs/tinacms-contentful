<!-- no toc -->
# Client-side with READ-only access tokens 

This guide covers how you can setup TinaCMS to handle READ-only data from Contentful in your application. Even when the CMS is disabled, you can use it to display all of the data in your Contentful space(s).

We will cover how to do the following in plain JavaScript or in React:

- [Client-side with READ-only access tokens](#client-side-with-read-only-access-tokens)
  - [Pre-requisites](#pre-requisites)
  - [Fetching Your First Entry](#fetching-your-first-entry)
  - [Fetching Some Assets](#fetching-some-assets)
  - [Fetching A Content Type](#fetching-a-content-type)

## Pre-requisites

To follow this guide, the following is expected:

- You have a working application with TinaCMS already setup with Contentful. If not, [please follow the docs to add Contentful to a TinaCMS site](https://github.com/tinalabs/tinacms-contentful/blob/master/README.md#quick-start).
- You have setup [OAuth applications with Contentful](https://www.contentful.com/developers/docs/extensibility/oauth/) if you plan to have your users authenticate with Contentful.
- You have a space with Content Models and Entries ready to use, and have setup [delivery and preview API access tokens](https://www.contentful.com/developers/docs/references/authentication#api-keys-in-the-contentful-web-app) and have them readily available.

## Fetching Your First Entry

You can fetch your first publihed entry by getting the `ContentfulClient` off of the CMS and then calling `getEntry` or using the `useContentfulEntry` hook:

**Vanilla JS**:
```
const contentful = cms.api.contentful;
const entry = contentful.getEntry('ENTRY_ID')
```

**React**:
```
import React, { useState } from 'react'
import { useCMS } from 'tinacms'

const MyEntry = ({ entryId }) => {
  const [entry, loading, error] = useContentfulEntry(query, {
    mode: draft ? "preview" : "delivery"
  })

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div>
        <h2>Something went wrong...</div>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <article>
      <h2>{entry.fields.title}</h2>
      <p>{entry.sys.id}</p>
    </article>
  )
}
```

All requests made this way are made on behalf of the currently logged in user, or using the delivery and preview tokens you provided otherwise.

## Fetching Some Assets

You can also fetch assets on behalf of the user using the `ContentfulClient`:

```
const contentful = cms.api.contentful
contentful.getAsset('ASSET_ID')
  .then(asset => console.log(asset))
  .catch(error => console.error(error))
```

## Fetching A Content Type

Finally, can also fetch content types on behalf of the user using the `ContentfulClient`:

```
const contentful = cms.api.contentful
contentful.getContentType('CONTENT_TYPE_ID')
  .then(contentType => console.log(contentType))
  .catch(error => console.error(error))
```
