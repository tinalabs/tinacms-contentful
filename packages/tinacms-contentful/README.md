# `tinacms-contentful`

A library for using Contentful with TinaCMS

- [`tinacms-contentful`](#tinacms-contentful)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Setup](#setup)
    - [Media](#media)
  - [APIs](#apis)
    - [Contentful Client](#contentful-client)
      - [Options](#options)
      - [Properties](#properties)
      - [Methods](#methods)

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

## APIs

The library has the following core APIs:

- [ContentfulClient](#contentful-client): an API client for communicating with Contentful that integrates directly with the CMS.
- [ContentfulMediaStore]()

There are other public APIs as well. To learn more, [read the full API documentation](https://tinalabs.github.io/tinacms-contentful/modules.html).

### Contentful Client

Creates a TinaCMS API client for communicating with a Contentful Space.

#### Options

The client takes the [following constructor arguments](https://tinalabs.github.io/tinacms-contentful/interfaces/contentfulclientoptions.html).

#### Properties

The Client has the following properties:

- [`allowedOrigins`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#allowedorigins): the [FQDNs](https://en.wikipedia.org/wiki/Fully_qualified_domain_name) allowed to receive Oauth bearer tokens. Defaults to the window hostname.
- [`environment`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#environment): the current Contentful environment the space is communicating with.
- [`rateLimit`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#ratelimit): the rate limit at which API operation will be throttled to.
- [`sdks`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#sdks): the Contentful SDK Client instances for this space.

#### Methods

The Client has the following methods:

- [`authenticate`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#authenticate): triggers a popup window OAuth workflow .
- [`setEnvironment`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#setenvironment): changes the environment the space is communicating with.
- [`getEntry`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#getentry): fetch a published `delivery`, draft `preview`, or editable `management` entry. 
- [`getEntries`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#getentries): fetch multiple published `delivery`, draft `preview`, or editable `management` entries.
- [`createEntry`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#createentry): create a new entry for a specific content model.
- [`updateEntry`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#updateentry): update an existing entry with new data.
- [`deleteEntry`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#deleteentry): delete a specific entry.
- [`publishEntry`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#publishentry): publish a specific entry.
- [`unpublishEntry`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#unpublishentry): unpublish a specific entry.
- [`archiveEntry`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#archiveentry): archive a specific entry.
- [`getAsset`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#getasset): fetch a published `delivery`, or draft `preview` asset.
- [`getAssets`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#getassets): fetch multiple published `delivery`, or draft `preview` assets.
- [`getAssetCollection`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#getassetcollection): fetch a paginated collection of published `delivery`, or draft `preview` assets.
- [`createAsset`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#createasset): create a new asset from a file upload.
- [`updateAsset`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#updateasset): update an existing asset from a file upload.
- [`deleteAsset`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#deleteasset): delete a specific asset.
- [`archiveAsset`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#archiveasset): archive a specific asset.
- [`getContentType`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#getcontenttype): fetch a specific content type.
- [`sync`](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html#sync): \[EXPERIMENTAL\] Fetch all entries and assets from the space in the given environment to allow access without network connection.