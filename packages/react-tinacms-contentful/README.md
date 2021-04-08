# `react-tinacms-contentful`

A library for using Contentful with TinaCMS and React.js

- [`react-tinacms-contentful`](#react-tinacms-contentful)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Setup](#setup)
    - [Media](#media)
  - [APIs](#apis)
    - [Provider](#provider)
    - [Hooks](#hooks)

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

## APIs

The library has the following core APIs:

- [ContentfulClient]([#contentful-client](https://tinalabs.github.io/tinacms-contentful/index.html#contentful-client)): an API client for communicating with Contentful that integrates directly with the CMS.
- [ContentfulMediaStore](https://tinalabs.github.io/tinacms-contentful/classes/contentfulmediastore.html): a media store that uses a `ContentfulClient` to manage media for a single space.
- [Provider](#provider): a React provider for official plugins and authorization.
- [Hooks](#hooks): a series of React Hooks for interacting with Contentful in your React app and CMS Plugins.

There are other public APIs as well. To learn more, [read the full React API documentation](https://tinalabs.github.io/react-tinacms-contentful/modules.html) or [read the full JavaScript API documentation](https://tinalabs.github.io/tinacms-contentful/index.html).

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

- [`useContentful`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/modules.html#usecontentful): retreives the [`ContentfulClient`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/classes/contentfulclient.html) off of the CMS, and allows specifying a space ID when using multiple spaces.
- [`useContentfulDelivery`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/modules.html#useContentfulDelivery): retreives a [delivery client](https://contentful.github.io/contentful.js/contentful/latest/index.html) from the `ContentfulClient` and allows specifying a space ID when using multiple spaces.
- [`useContentfulPreview`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/modules.html#useContentfulPreview): retreives a [preview client](https://contentful.github.io/contentful.js/contentful/latest/index.html) from the `ContentfulClient` and allows specifying a space ID when using multiple spaces.
- [`useContentfulManagement`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/modules.html#useContentfulManagement): retreives a [management client](https://contentful.github.io/contentful-management.js/contentful-management/7.14.0/) from the `ContentfulClient` and allows specifying a space ID when using multiple spaces.
- [`useContentfulEntry`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/modules.html#usecontentfulentry): fetches an entry from contentful and returns the entry, loading constant, and error constant, and allows specifying a space ID when using multiple spaces.
- [`useContentfulEntries`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/modules.html#usecontentfulentries): fetches multiple entries from contentful and returns the entry, loading constant, and error constant, and allows specifying a space ID when using multiple spaces.
- [`useContentfulEntryForm`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/modules.html#usecontentfulentryform): creates a TinaCMS form for a given entry, which can be registered with the CMS or used to provide editing UIs to end users.
- [`useContentfulEntriesForm`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/modules.html#usecontentfulentryform): creates a TinaCMS form for multiple entries, which can be registered with the CMS or used to provide editing UIs to end users.
- [`useContentfulAuthRedirect`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/modules.html#usecontentfulauthredirect): sets up a route to be used as the callback URL for an OAuth application.
