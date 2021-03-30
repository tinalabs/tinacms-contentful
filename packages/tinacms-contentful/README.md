# `tinacms-contentful`

A library for using Contentful with TinaCMS

## Usage

### Installation

To install the package, run:

```
npm install tinacms-contentful contentful contentful-management
```

### Setup

To setup TinaCMS with Contentful, you must create an instance of the TinaCMS `ContentfulClient` for each space you want to edit content from.

**For a single space:**

```
import { ContentfulClient } from 'tinacms-contentful'

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

const cms = new TinaCMS({
  apis: {
    contentful
  }
})
```

Or if the CMS has already been created:

```
cms.registerApi('contentful', contentful)
```

**For multiple spaces**:

```
import { createContentfulClientForSpaces } from 'tinacms-contentful';

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
```

### Media

To add support for media, you must setup a media store for the space media should be uploaded to.

**For a single space:**

```
import { ContentfulClient, ContentfulMediaStore } from 'tinacms-contentful'

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

const contentfulMediaStore = new ContentfulMediaStore(contentful);

const cms = new TinaCMS({
  apis: {
    contentful
  },
  media: contentfulMediaStore
})
```

**For multiple spaces**:

The media store is only capable of acting on a single space at a time. To change spaces dynamically, run:

```
const spaceId = 'example-id'
const space = cms.api.contentful[spaceId]
cms.media.store = new ContentfulMediaStore(space)
```

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