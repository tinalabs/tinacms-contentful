# `react-tinacms-contentful`

A library for using Contentful with TinaCMS and React.js

- [`react-tinacms-contentful`](#react-tinacms-contentful)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Setup](#setup)
    - [Media](#media)
  - [React APIs](#react-apis)
    - [Provider](#provider)
    - [Hooks](#hooks)
  - [ContentfulClient](#contentfulclient)
    - [Properties](#properties)
    - [Methods](#methods)

## Usage

### Installation

To install the package, run:

```
npm install react-tinacms-contentful tinacms-contentful contentful contentful-management
```

### Setup

To setup TinaCMS with Contentful, you must create an instance of the TinaCMS `ContentfulClient` for each space you want to edit content from.

**For a single space:**

```
import React, { useMemo } from 'React'
import { TinaProvider } from 'tinacms'
import { ContentfulClient } from 'tinacms-contentful'

export default function MyApp() {
  const cms = useMemo(() => {
    const contentful = new ContentfulClient({
      spaceId: /* Contentful Space ID */,
      defaultEnvironmentId: /* Contentful environment ID to use by default. Default: master */,
      accessTokens: {
        delivery: /* Contentful delivery access token for the space */,
        preview: /* Contentful preview access token for the space */,
      }
      clientId: /* OAuth App Client ID */,
      redirectUrl: /* OAuth App Callback URL */,
      rateLimit: /* API Rate Limit for your Contentful Plan (Requests per second). Default: 4 */,
      insecure: /* If true, uses same-site HTTPS cookies to create a session. Default: false */
    })

    return new TinaCMS({
      apis: {
        contentful
      }
    })
  });

  return (
    <TinaProvider cms={cms}>
      <TinaContentfulProvider>
        <div>Hello world</div>
      </TinaContentfulProvider>
    </TinaProvider>
  )
}
```

Or if the CMS has already been created:

```
import { useCMS } from 'tinacms'

export default function MyComponent() {
  const cms = useCMS();

  useEffect(() => {
    const contentful = new ContentfulClient({
      spaceId: /* Contentful Space ID */,
      defaultEnvironmentId: /* Contentful environment ID to use by default. Default: master */,
      accessTokens: {
        delivery: /* Contentful delivery access token for the space */,
        preview: /* Contentful preview access token for the space */,
      }
      clientId: /* OAuth App Client ID */,
      redirectUrl: /* OAuth App Callback URL */,
      rateLimit: /* API Rate Limit for your Contentful Plan (Requests per second). Default: 4 */,
      insecure: /* If true, uses same-site HTTPS cookies to create a session. Default: false */
    })

    cms.registerApi('contentful', contentful)
  }, [])

  return (
    <div>Hello world!</div>
  )
}
```

**For multiple spaces**:

```
import React, { useMemo } from 'React'
import { TinaProvider } from 'tinacms'
import { createContentfulClientForSpaces } from 'tinacms-contentful';

export default function MyApp() {
  const cms = useMemo(() => {
    const spaces = [
      {
        spaceId: /* Contentful Space ID */,
        defaultEnvironmentId: /* Contentful environment ID to use by default. Default: master */,
        accessTokens: {
          delivery: /* Contentful delivery access token for the space */,
          preview: /* Contentful preview access token for the space */,
        }
      },
      {
        spaceId: /* Contentful Space ID */,
        defaultEnvironmentId: /* Contentful environment ID to use by default. Default: master */,
        accessTokens: {
          delivery: /* Contentful delivery access token for the space */,
          preview: /* Contentful preview access token for the space */,
        }
      }
    ]

    const contentful = createClientForSpaces(spaces, {
      clientId: /* OAuth App Client ID */,
      redirectUrl: /* OAuth App Callback URL */,
      rateLimit: /* API Rate Limit for your Contentful Plan (Requests per second). Default: 4 */,
      insecure: /* If true, uses same-site HTTPS cookies to create a session. Default: false */
    })

    return new TinaCMS({
      apis: {
        contentful
      }
    })
  });

  return (
    <TinaProvider cms={cms}>
      <TinaContentfulProvider>
        <div>Hello world</div>
      </TinaContentfulProvider>
    </TinaProvider>
  )
}
```

### Media

To add support for media, you must setup a media store for the space media should be uploaded to.

**For a single space:**

```diff
import React, { useMemo } from 'React'
import { TinaProvider } from 'tinacms'
import { ContentfulClient, ContentfulMediaStore } from 'tinacms-contentful'

export default function MyApp() {
  const cms = useMemo(() => {
    const contentful = new ContentfulClient({
      spaceId: /* Contentful Space ID */,
      defaultEnvironmentId: /* Contentful environment ID to use by default. Default: master */,
      accessTokens: {
        delivery: /* Contentful delivery access token for the space */,
        preview: /* Contentful preview access token for the space */,
      }
      clientId: /* OAuth App Client ID */,
      redirectUrl: /* OAuth App Callback URL */,
      rateLimit: /* API Rate Limit for your Contentful Plan (Requests per second). Default: 4 */,
      insecure: /* If true, uses same-site HTTPS cookies to create a session. Default: false */
    })
    const contentfulMediaStore = new ContentfulMediaStore(contentful)

    return new TinaCMS({
      apis: {
        contentful
      },
      media: contentfulMediaStore
    })
  });

  return (
    <TinaProvider cms={cms}>
      <TinaContentfulProvider>
        <div>Hello world</div>
      </TinaContentfulProvider>
    </TinaProvider>
  )
}
```

**For multiple spaces**:

The media store is only capable of acting on a single space at a time. To change spaces dynamically, run:

```
import React, { useMemo } from 'React'
import { TinaProvider } from 'tinacms'
import { ContentfulClient, ContentfulMediaStore } from 'tinacms-contentful'

+export default function MyApp(currentSpaceId) {
      const spaces = [
      {
        spaceId: /* Contentful Space ID */,
        defaultEnvironmentId: /* Contentful environment ID to use by default. Default: master */,
        accessTokens: {
          delivery: /* Contentful delivery access token for the space */,
          preview: /* Contentful preview access token for the space */,
        }
      },
      {
        spaceId: /* Contentful Space ID */,
        defaultEnvironmentId: /* Contentful environment ID to use by default. Default: master */,
        accessTokens: {
          delivery: /* Contentful delivery access token for the space */,
          preview: /* Contentful preview access token for the space */,
        }
      }
    ]

    const contentful = createClientForSpaces(spaces, {
      clientId: /* OAuth App Client ID */,
      redirectUrl: /* OAuth App Callback URL */,
      rateLimit: /* API Rate Limit for your Contentful Plan (Requests per second). Default: 4 */,
      insecure: /* If true, uses same-site HTTPS cookies to create a session. Default: false */
    })

+    const contentfulMediaStore = new ContentfulMediaStore(contentful[currentSpaceId])

    return new TinaCMS({
      apis: {
        contentful
      },
      media: contentfulMediaStore
    })
  });

  return (
    <TinaProvider cms={cms}>
      <TinaContentfulProvider>
        <div>Hello world</div>
      <TinaContentfulProvider>
    </TinaProvider>
  )
}
```

## React APIs

`react-tinacms-contentful` exposes the following React APIs:

### Provider

When using Contentful with TinaCMS and React, you must wrap the CMS-enabled portions of your app with the `TinaContentfulProvider`:

```
  return (
    <TinaProvider cms={cms}>
      <TinaContentfulProvider>
        <div>Hello world</div>
      <TinaContentfulProvider>
    </TinaProvider>
  )
```

### Hooks

- `useContentful`
- `useContentfulDelivery`
- `useContentfulPreview`
- `useContentfulManagement`
- `useContentfulEntry`
- `useContentfulEntries`
- `useContentfulEntryForm`
- `useContentfulEntriesForm`
- `useContentfulAuthRedirect`

## ContentfulClient

### Properties

The Client has the following properties:

- `allowedOrigins`
- `environment`
- `sdks`
- `rateLimit`

### Methods

The Client has the following methods:

- `authenticate`
- `setEnvironment`
- `getEntry`
- `getEntries`
- `createEntry`
- `updateEntry`
- `deleteEntry`
- `publishEntry`
- `unpublishEntry`
- `archiveEntry`
- `getAsset`
- `getAssets`
- `getAssetCollection`
- `createAsset`
- `updateAsset`
- `deleteAsset`
- `archiveAsset`
- `getContentType`
- `sync`