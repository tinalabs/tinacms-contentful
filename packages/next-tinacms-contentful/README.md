# `next-tinacms-contentful`

A utility library for using Contentful with TinaCMS and Next.js

- [`next-tinacms-contentful`](#next-tinacms-contentful)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Fetching Entries On The Server](#fetching-entries-on-the-server)
    - [Edit Mode](#edit-mode)
  - [APIs](#apis)
    - [Server-side Methods](#server-side-methods)

## Usage

If you are looking to use Contentful in client-side JS, please see one of the following:

- [Vanilla JS](/packages/tinacms-contentful/README.md)
- [React](/packages/react-tinacms-contentful/README.md)

If you are looking to use Contentful inside of Next.js' build-time and serverless logic like `getStaticProps` and `getServerSideProps`, continue reading:

### Installation

To install the package, run:

```
npm install next-tinacms-contentful react-tinacms-contentful tinacms-contentful contentful contentful-management
```

### Fetching Entries On The Server

**Fetching A Single Entry**

To fetch a single entry, you can use `getEntry`:

```javascript
import getEntry from 'next-tinacms-contentful'

const contentfulOptions = {
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
}

export async function getStaticProps() {
  try {
    const entry = await getEntry('EXAMPLE_ID', contentfulOptions);

    return {
      props: {
        entry
      }
    }
  } catch (error) {
    console.error(error)

    return {
      notFound: true
    }
  }
}
```

**Fetching Many Entries**

To fetch many entries, you can use `getEntries`:

```javascript
import getEntries from 'next-tinacms-contentful'

const contentfulOptions = {
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
}

export async function getStaticProps() {
  try {
    const entry = await getEntries({ content_type: "EXAMPLE_CONTENT_TYPE_ID" }, contentfulOptions);

    return {
      props: {
        entry
      }
    }
  } catch (error) {
    console.error(error)

    return {
      notFound: true
    }
  }
}
```

### Edit Mode
**Server-side Sessions with Next.js Preview Mode**

You can enable an "edit mode" for your site using [server-side sessions with Next.js Preview mode](https://nextjs.org/docs/advanced-features/preview-mode), which uses HTTP only cookies to allow server-side logic to be run in front of requests, providing a user specific payload of data on `context.previewData` in `getStaticProps`, `getServerSideProps`, and in API routes, as well as allowing `getStaticProps` to work like `getServerSideProps` when users log in to edit pages to allow editing-specific business logic.

First, in `pages/api` add a new API route called `editing.js` with the following contents:

```
import { editModeHandler } from 'next-tinacms-contentful'

export const editingHandler = editModeHandler(60)
```

`editModeHandler` creates a serverless function that handles creating an "editing session" by enabling Next.js preview mode for the current user if it is not enabled, and adding metadata to Next.js' preview data to allow changing how the page behaves for editing.

**Values**

| Key | Type | Description |
| --- | --- | --- |
| `context.previewData.tina_enabled` | `boolean` | True if logged in, false if not |
| `context.previewData.contentful_bearer_token` | `string \| null` | If defined, is the bearer token for the current logged in user |


---

Then, you need to update the CMS to enable edit mode when the user finishes logging in. We do this by adding some configuration to the `ContentfulProvider`, which is usually found in `pages/_app.js`:

```
import { toggleEditing } from 'next-tinacms-contentful'

export function MyApp({ pageProps, Component }) {
  const cms = useMemo(() => {
    ...
  }, [])

  return (
    <TinaProvider cms={cms}>
      <ContentfulProvider 
        onLogin={() => toggleEditing(true)}
        onLogout={) => toggleEditing(false)}
      >
        <Component {...pageProps} />
      </ContentfulProvider>
    </TinaProvider>
  )
}
```

`toggleEditing` makes a HTTP POST request to the `api/editing` route, enabling or disabling the cms based on the boolean value passed in, and logs any errors to the user's console.

---

Finally in any of your pages, you can use `getStaticProps` or `getServerSideProps` to check if edit mode is enabled:

```
export function getStaticProps(context) {
  const entry = getEntry('EXAMPLE_ID', { 
    ...contentfulOptions,
    mode: context.previewData.tina_enabled ? "preview" : "delivery"
  })

  return {
    props: {
      entry
    }
  }
}
```
## APIs

The library has the following core APIs:

- [ContentfulClient](https://tinalabs.github.io/tinacms-contentful/index.html#contentful-client): an API client for communicating with Contentful that integrates directly with the CMS.
- [ContentfulMediaStore](https://tinalabs.github.io/tinacms-contentful/classes/contentfulmediastore.html): a media store that uses a `ContentfulClient` to manage media for a single space.
- [Provider](https://tinalabs.github.io/react-tinacms-contentful/index.html#provider): a React provider for official plugins and authorization.
- [Hooks](https://tinalabs.github.io/react-tinacms-contentful/index.html#hooks): a series of React Hooks for interacting with Contentful in your React app and CMS Plugins.
- [Server-side Methods](#server-side-methods): utility methods for interacting with Contentful on the server.

There are other public APIs as well. To learn more, [read the full Next.js API documentation](https://tinalabs.github.io/next-tinacms-contentful/modules.html) or [read the full JavaScript API documentation](https://tinalabs.github.io/tinacms-contentful/index.html).

### Server-side Methods

- [`getEntry](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/modules.html#getentry): fetch a published `delivery`, draft `preview`, or editable `management` entry. 
- [`getEntries`](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/modules.html#getentries): fetch multiple published `delivery`, draft `preview`, or editable `management` entries.
- [`getAsset`](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/modules.html#getasset): fetch a published `delivery`, or draft `preview` asset.
- [`getAssets`](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/modules.html#getassets): fetch multiple published `delivery`, or draft `preview` assets.
- [`proxy`](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/modules.html#proxy): [EXPERIMENTAL] proxies requests to Contentful in server side logic, attaching bearer tokens from [edit mode](#edit-mode) on the way.
- [`toggleEditing`](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/modules.html#toggleediting): sends a fetch request to enable [edit mode](#edit-mode).
- [`editModeHandler`](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/modules.html#editmodehandler): a serverless request handler for toggling [edit mode](#edit-mode) in a Next.js API function.